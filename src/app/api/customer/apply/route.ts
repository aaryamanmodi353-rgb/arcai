import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Lead from '@/models/Lead';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await verifyAuth(token) as any;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    
    const { propertyId, propertyName, type, description, fullDetails } = await req.json();

    let requirement = '';
    let message = '';
    
    if (type === 'sell') {
      requirement = 'Selling Property';
      message = `Customer wants to list their property: ${description}`;
    } else {
      requirement = `Buying: ${propertyName}`;
      if (fullDetails) {
        message = `[GLOBAL_PROPERTY]${JSON.stringify(fullDetails)}`;
      } else {
        message = `Customer is interested in property: ${propertyName} (ID: ${propertyId})`;
      }
    }

    const lead = await Lead.create({
      name: user.name,
      location: fullDetails?.location || 'Website Lead',
      requirement: requirement,
      budget: fullDetails?.price || 'TBD',
      timeline: 'Immediate',
      message: message,
      analysis: {
        summary: `New automated lead from customer portal.`,
        intent: 'ready_to_buy',
        intent_reasoning: 'Customer actively submitted an application via the portal.',
        key_requirements: [requirement],
        objections: [],
        next_action: 'Call to confirm details',
        suggested_response: 'Hi! I saw you applied for a property on our portal. When is a good time to call?',
        scores: {
          intent_strength: 9,
          budget_fit: 5,
          timeline_urgency: 8,
          information_completeness: 5,
          engagement_quality: 7
        },
        score_rationale: 'High intent due to explicit portal application.',
        confidence: 'high',
        missing_info: ['Budget', 'Exact timeline']
      },
      priority: {
        score: 50,
        tier: 'warm',
        atRisk: false
      },
      chatHistory: [],
      debriefHistory: []
    });

    return NextResponse.json({ success: true, leadId: lead._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await verifyAuth(token) as any;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('id');

    if (!leadId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await connectToDatabase();
    
    const lead = await Lead.findById(leadId);
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Ensure the customer can only delete their own leads
    if (lead.name !== user.name) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    lead.status = 'withdrawn';
    lead.closeReason = 'Withdrawn by Customer';
    await lead.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
