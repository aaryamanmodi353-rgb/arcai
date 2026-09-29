import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectMongo from '@/lib/mongoose';
import Lead from '@/models/Lead';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectMongo();
    
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Lead ID' }, { status: 400 });
    }

    const { reason } = await req.json();
    if (!reason) {
      return NextResponse.json({ error: 'Close reason is required' }, { status: 400 });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    lead.status = 'closed';
    lead.closeReason = reason;

    // Add debrief note
    if (!lead.debriefHistory) lead.debriefHistory = [];
    lead.debriefHistory.push({
      timestamp: new Date(),
      notes: `Lead closed by admin. Reason: "${reason}"`,
      what_changed: ['Status updated to closed']
    });

    lead.markModified('debriefHistory');
    await lead.save();

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error('Error closing lead:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
