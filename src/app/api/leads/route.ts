import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Lead from '@/models/Lead';
import { analyzeLead } from '@/lib/ai/provider';
import { calculatePriority } from '@/lib/ai/scoring';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, location, requirement, budget, timeline, message } = body;

    if (!name || !location || !requirement || !budget || !timeline || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const leadData = { name, location, requirement, budget, timeline };
    
    // Call AI to analyze
    const analysis = await analyzeLead(leadData, message);
    
    // Calculate priority deterministically
    const priority = calculatePriority(analysis.scores);

    // Save to DB
    const newLead = new Lead({
      ...leadData,
      message,
      analysis,
      priority,
      chatHistory: [],
      debriefHistory: []
    });

    await newLead.save();

    return NextResponse.json(newLead, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: error.message || 'Failed to create lead' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all leads, sorted by priority score (descending)
    const leads = await Lead.find().sort({ 'priority.score': -1, createdAt: -1 }).lean();
    
    return NextResponse.json(leads, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
  }
}
