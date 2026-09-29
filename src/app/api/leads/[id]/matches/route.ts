import { NextResponse } from 'next/server';
import Lead from '@/models/Lead';
import mongoose from 'mongoose';
import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey });
const modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    if (!process.env.MONGODB_URI) {
      throw new Error('Database not configured');
    }
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const lead = await Lead.findById(resolvedParams.id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const systemPrompt = `
You are the Arc AI Global Real Estate Matchmaker, connected to a worldwide property database.
The Admin is searching for properties for a client.
Client Requirements:
Requirement: ${lead.requirement}
Budget: ${lead.budget}
Location Preference: ${lead.location}
Context: ${lead.analysis.summary}

Based on the client's preferred location (anywhere in the world), INVENT 3 highly realistic, premium luxury properties that are currently "for sale" in that specific location that match their criteria.
Use real, prestigious neighborhoods for that city, realistic pricing, and believable luxury features.
Act as a persuasive middleman and write a sales pitch for each.

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
        { role: "user", content: "Generate the matches JSON." }
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
    
    // Attach our gorgeous luxury images
    if (matchData.matches && Array.isArray(matchData.matches)) {
      matchData.matches = matchData.matches.map((m: any, idx: number) => ({
        ...m,
        images: globalImageSets[idx % globalImageSets.length]
      }));
    }

    return NextResponse.json(matchData);

  } catch (error) {
    console.error('Matchmaker error:', error);
    return NextResponse.json({ error: 'Failed to generate matches' }, { status: 500 });
  }
}
