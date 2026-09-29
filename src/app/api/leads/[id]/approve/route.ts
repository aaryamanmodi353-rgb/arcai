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

    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    lead.status = 'approved';

    // Add debrief note
    if (!lead.debriefHistory) lead.debriefHistory = [];
    lead.debriefHistory.push({
      timestamp: new Date(),
      notes: `Lead approved by admin. Deal won!`,
      what_changed: ['Status updated to approved']
    });

    lead.markModified('debriefHistory');
    await lead.save();

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error('Error approving lead:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
