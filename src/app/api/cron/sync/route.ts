import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Inventory } from '@/lib/models';
import { Groq } from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || '';
const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export async function POST(req: Request) {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const groq = new Groq({ apiKey });

    // Ask Groq to generate 2 highly detailed, realistic luxury properties in Mumbai
    const prompt = `
      You are an automated real estate market scraper. Generate exactly 2 highly detailed, realistic luxury properties located in Mumbai, India.
      Return the output ONLY as a valid JSON array of objects. Do not include markdown formatting or extra text.
      Each object must have exactly these fields:
      - name: string (e.g., "Lodha Altamount 4BHK", "Sea-Facing Penthouse at Worli")
      - location: string (e.g., "Altamount Road", "Worli Sea Face", "Bandra West")
      - price: string (e.g., "₹ 25.5 Cr", "₹ 14.0 Cr")
      - bhk: string (e.g., "4 BHK", "5 BHK Penthouse")
      - description: string (2-3 sentences of luxurious, compelling description)
      - images: array of strings (use exactly this URL for now: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80")
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: modelName,
      temperature: 0.7,
      response_format: { type: 'json_object' } // Enforce JSON
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from Groq");
    }

    let parsed;
    try {
      // The prompt asks for an array, but json_object mode requires a root object.
      // So Groq might wrap it in something like { "properties": [...] }
      const json = JSON.parse(responseContent);
      parsed = json.properties || json.listings || Object.values(json)[0];
      
      if (!Array.isArray(parsed)) {
        // Fallback if it returned just a raw array string (some models ignore json_object rules if prompted for array)
        parsed = JSON.parse(responseContent);
      }
    } catch (e) {
      console.error("Failed to parse Groq response:", responseContent);
      return NextResponse.json({ error: 'Failed to generate valid properties' }, { status: 500 });
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Generated data is not an array' }, { status: 500 });
    }

    // Insert into DB
    const inserted = await Inventory.insertMany(parsed);

    return NextResponse.json({ success: true, count: inserted.length, properties: inserted });

  } catch (error: any) {
    console.error("Scraper Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
