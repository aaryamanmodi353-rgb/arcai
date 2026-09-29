import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongoose';
import Lead from '@/models/Lead';
import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey });
const modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

// We use our reliable image arrays to make the generated global properties look stunning
const globalImageSets = [
  [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
  ]
];

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await verifyAuth(token) as any;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { query } = await req.json();

    const systemPrompt = `
You are the Arc AI Global Real Estate Matchmaker, connected to a worldwide property database.
The user is searching for properties. Extract their desired location from their query. 
If they specify a city anywhere in the world (e.g. Paris, Tokyo, Dubai, Miami), you must INVENT 3 highly realistic, premium luxury properties that are currently "for sale" in that specific location that match their criteria.
Use real, prestigious neighborhoods for that city, realistic local currency and pricing, and believable luxury features.
Act as a persuasive middleman to convince them to buy.

Output JSON strictly matching this schema:
{
  "matches": [
    {
      "property_id": "gen_1",
      "property_name": "Name of the building or villa",
      "location": "Neighborhood, City",
      "bhk": "e.g. 3 BHK or 4 Bedroom Villa",
      "price": "e.g. € 4,500,000",
      "match_score": 95,
      "sales_pitch": "A highly persuasive 3-sentence pitch explaining why this location is incredible.",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Minor con 1"]
    }
  ]
}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Customer Query: ${query}` }
      ],
      model: modelName,
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const text = chatCompletion.choices[0]?.message?.content || "{}";
    let matchData;
    
    try {
      matchData = JSON.parse(text);
    } catch (e) {
      const match = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (match) {
        matchData = JSON.parse(match[1]);
      } else {
        throw e;
      }
    }

    // Attach our gorgeous luxury images to the AI-generated global properties
    if (matchData.matches && Array.isArray(matchData.matches)) {
      matchData.matches = matchData.matches.map((m: any, idx: number) => ({
        ...m,
        images: globalImageSets[idx % globalImageSets.length]
      }));
    }
      
    // Save this interaction as a Lead so the Admin can see the conversation
    await connectToDatabase();
    await Lead.create({
      name: user.name,
      location: 'Global AI Matchmaker',
      requirement: `Global Search: ${query.substring(0, 50)}...`,
      budget: 'TBD',
      timeline: 'Exploring',
      message: `Customer used the Global API Matchmaker. Query: ${query}`,
      chatHistory: [
        { role: 'user', content: query },
        { role: 'assistant', content: `I searched our global database and found some incredible properties for you!\n\n${matchData.matches.map((m: any) => `**${m.property_name}** in ${m.location} (${m.match_score}% Match)\n${m.sales_pitch}`).join('\n\n')}` }
      ],
      analysis: {
        summary: `Customer is exploring international/global properties.`,
        intent: 'early_research',
        intent_reasoning: 'Customer is testing global locations.',
        key_requirements: [query.substring(0, 50)],
        objections: [],
        next_action: 'Review their global matches and follow up with international desk',
        suggested_response: 'Hi! I saw you were looking at international properties. I can arrange a virtual tour!',
        scores: {
          intent_strength: 7,
          budget_fit: 5,
          timeline_urgency: 4,
          information_completeness: 6,
          engagement_quality: 9
        },
        score_rationale: 'High engagement searching global markets.',
        confidence: 'medium',
        missing_info: ['Relocation timeline', 'Visa/tax constraints']
      },
      priority: {
        score: 65,
        tier: 'warm',
        atRisk: false
      }
    });

    return NextResponse.json(matchData);

  } catch (error) {
    console.error('Matchmaker error:', error);
    return NextResponse.json({ error: 'Failed to generate global matches' }, { status: 500 });
  }
}
