import Groq from "groq-sdk";
import { analysisSystemPrompt, debriefSystemPrompt, callBriefSystemPrompt, chatSystemPrompt } from './prompts';

const apiKey = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey });

// Recommended model: openai/gpt-oss-20b
const modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

export async function analyzeLead(leadData: any, customerMessage: string) {
  const prompt = `
<lead_record>
Name: ${leadData.name}
Location: ${leadData.location}
Property requirement: ${leadData.requirement}
Budget: ${leadData.budget}
Buying timeline: ${leadData.timeline}
</lead_record>
<customer_message>
${customerMessage}
</customer_message>
  `;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: analysisSystemPrompt },
      { role: "user", content: prompt }
    ],
    model: modelName,
    response_format: { type: "json_object" },
  });

  const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
  return JSON.parse(responseContent);
}

export async function generateCallBrief(analysis: any) {
  const prompt = `Analysis:\n${JSON.stringify(analysis)}`;
  
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: callBriefSystemPrompt },
      { role: "user", content: prompt }
    ],
    model: modelName,
    response_format: { type: "json_object" },
  });

  const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
  return JSON.parse(responseContent);
}

export async function debriefCall(previousAnalysis: any, leadRecord: any, callNotes: string, chatSummary: string = "") {
  const prompt = `
<previous_analysis>
${JSON.stringify(previousAnalysis)}
</previous_analysis>
<lead_record>
${JSON.stringify(leadRecord)}
</lead_record>
<chat_summary>
${chatSummary}
</chat_summary>
<call_notes>
${callNotes}
</call_notes>
  `;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: debriefSystemPrompt },
      { role: "user", content: prompt }
    ],
    model: modelName,
    response_format: { type: "json_object" },
  });

  const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
  return JSON.parse(responseContent);
}

export async function chatWithLead(leadContext: any, newQuestion: string, history: any[] = []) {
  const contextStr = `
<lead_context>
${JSON.stringify(leadContext)}
</lead_context>
  `;

  // Map history to groq schema
  const messages: any[] = [
    { role: "system", content: chatSystemPrompt }
  ];
  
  history.forEach(h => {
    messages.push({
      role: h.role, // 'user' or 'assistant'
      content: h.content
    });
  });

  messages.push({
    role: "user",
    content: contextStr + '\n' + newQuestion
  });

  const chatCompletion = await groq.chat.completions.create({
    messages,
    model: modelName,
    stream: true,
  });

  // Provide a compatible async iterable stream object to the frontend matching our previous structure
  // The frontend loop expects: for await (const chunk of stream) { result += chunk.text(); }
  return {
    stream: (async function* () {
      for await (const chunk of chatCompletion) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          yield { text: () => text };
        }
      }
    })()
  };
}
