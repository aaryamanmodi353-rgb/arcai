import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Lead from '@/models/Lead';
import { debriefCall } from '@/lib/ai/provider';
import { calculatePriority } from '@/lib/ai/scoring';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await req.json();
    const { callNotes } = body;

    if (!callNotes) {
      return NextResponse.json({ error: 'Call notes are required' }, { status: 400 });
    }

    const lead = await Lead.findById(id);

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const leadRecord = {
      name: lead.name,
      location: lead.location,
      requirement: lead.requirement,
      budget: lead.budget,
      timeline: lead.timeline,
      message: lead.message
    };
    
    // Build a quick summary of chat history for context
    const chatSummary = lead.chatHistory?.map(c => `[${c.role}]: ${c.content}`).join('\n') || "No chat history";

    // Call AI to debrief
    const debrief = await debriefCall(lead.analysis, leadRecord, callNotes, chatSummary);

    const updatedScores = debrief.updated_scores || lead.analysis.scores;
    const finalScores = {
      ...lead.analysis.scores,
      ...updatedScores
    };

    // Re-score based on updated scores from the debrief
    const newPriority = calculatePriority(finalScores);

    // Update the lead's analysis with debrief results
    if (debrief.updated_requirements) lead.analysis.key_requirements = debrief.updated_requirements;
    if (debrief.updated_objections) lead.analysis.objections = debrief.updated_objections;
    lead.analysis.scores = finalScores;
    if (debrief.next_action) lead.analysis.next_action = debrief.next_action;
    if (debrief.follow_up_message) lead.analysis.suggested_response = debrief.follow_up_message;
    
    // Update priority
    lead.priority = newPriority;

    lead.markModified('analysis');
    lead.markModified('priority');

    // Log the debrief
    lead.debriefHistory.push({
      notes: callNotes,
      what_changed: debrief.what_changed || [],
      timestamp: new Date()
    });

    await lead.save();

    return NextResponse.json(lead, { status: 200 });
  } catch (error: any) {
    console.error('Error during debrief:', error);
    return NextResponse.json({ error: error.message || 'Debrief failed' }, { status: 500 });
  }
}
