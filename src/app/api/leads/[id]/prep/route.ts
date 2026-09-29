import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Lead from '@/models/Lead';
import { generateCallBrief } from '@/lib/ai/provider';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const lead = await Lead.findById(id);

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Call AI to generate a call prep brief
    const prepBrief = await generateCallBrief(lead.analysis);

    return NextResponse.json(prepBrief, { status: 200 });
  } catch (error: any) {
    console.error('Error generating prep brief:', error);
    return NextResponse.json({ error: error.message || 'Prep brief generation failed' }, { status: 500 });
  }
}
