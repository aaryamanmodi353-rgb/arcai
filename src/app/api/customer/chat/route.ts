import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const systemPrompt = `You are Arc Concierge, a high-end luxury real estate AI middleman for Arc. 
You are chatting directly with a prospective buyer/customer on their portal.
Your goal is to be immensely persuasive, enthusiastic, and helpful. 
Respond in short, punchy paragraphs. Use formatting to make it readable.
If they ask about properties, ask them about their preferred location, configuration, and budget.
Remind them they can use the AI Matchmaker form on this page to instantly generate global luxury property recommendations!`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
      ],
      model: model,
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I am currently unavailable.";

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error: any) {
    console.error('Error in customer chat:', error);
    return NextResponse.json({ error: error.message || 'Chat failed' }, { status: 500 });
  }
}
