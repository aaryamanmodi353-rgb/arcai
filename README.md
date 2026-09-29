# Masal AI: FDE Assignment (Round 2)

This is a small AI-powered web app designed to help real-estate salespeople prioritize inbound leads, prepare for calls, and keep track of follow-up contexts.

## What was Built
A complete Next.js (App Router) application with a modern UI (shadcn/ui + Tailwind CSS) and a MongoDB backend. The app integrates the Groq API to analyze incoming leads, score them deterministically based on extracted parameters, prepare call briefs, and act as an embedded sales copilot.

### Features:
1. **Lead Intake:** A form to capture lead details and the customer's raw message.
2. **AI Analysis & Scoring:** Extracts intents, requirements, objections, and sub-scores. Deterministic logic calculates a final score (0-100) and categorizes leads into Hot/Warm/Cold tiers.
3. **Conversational Copilot:** A chat interface grounded strictly in the lead's context, assisting salespeople with draft responses or tactical advice.
4. **Dashboard:** A priority-ranked view of all leads for quick triage.
5. **Custom Feature - Call Prep & Debrief Loop:**
   - **Before the Call:** Generates a quick 1-screen call prep brief containing an opener, discovery questions to fill missing info, and likely objections with rebuttals.
   - **After the Call:** Salesperson pastes raw notes. AI re-analyzes, updates the requirements/objections, and re-scores the lead.

## Architecture Overview
- **Frontend:** Next.js (React), Tailwind CSS, shadcn/ui.
- **Backend API:** Next.js API Routes (Serverless deployment ready).
- **Database:** MongoDB Atlas (Mongoose ORM).
- **AI Model:** Groq (`llama-3.3-70b-versatile`) via `groq-sdk`. JSON Mode ensures reliable data extraction.

### Workflow:
\`\`\`
Browser (Next.js UI)
   │
   ▼
Next.js API Routes
   ├─ POST /api/leads              → AI Analysis → Deterministic Score → MongoDB
   ├─ GET  /api/leads              → List sorted by score desc
   ├─ GET  /api/leads/:id          → Fetch lead details
   ├─ GET  /api/leads/:id/prep     → Generate Call Brief
   ├─ POST /api/leads/:id/debrief  → AI Re-analyze Notes → Update Score & DB
   └─ POST /api/leads/:id/chat     → Context-stuffed prompt → AI stream response
   │
   ▼
MongoDB (Atlas) & Groq API
\`\`\`

## Key Technical Decisions
1. **The LLM Extracts, Code Decides:** LLMs are bad at consistent numerical calibration. The AI provides sub-scores (0-10) for components like intent and timeline, but a deterministic TypeScript function computes the final priority score and applies a decay penalty for staleness.
2. **Schema-Validated Output:** Using `response_format: { type: "json_object" }` with Groq ensures strict JSON generation conforming to expected schemas.
3. **Context Stuffing over RAG:** Since a single lead's full history fits well within the token limit of Llama 3.3, vector databases and RAG would only introduce chunking errors. Context stuffing is more reliable here.
4. **Custom Feature Choice:** The Call Prep/Debrief loop directly solves the before/during/after lifecycle. It turns a static AI analysis into a living CRM record.

## How to Run Locally

1. Clone the repository.
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env.local\` file based on \`.env.example\`:
   \`\`\`env
   MONGODB_URI=your_mongodb_connection_string
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=llama-3.3-70b-versatile
   \`\`\`
4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open [http://localhost:3000](http://localhost:3000)

## Known Limitations
- The current chat implementation waits for the full stream to be built in the API route before responding to the frontend to keep the implementation simple. Production would stream chunks directly to the UI.
- Deterministic staleness decay isn't currently updated on a cron job; it relies on the `daysSinceContact` calculation at runtime (which is currently simplified in `scoring.ts`).

## AI Usage Disclosure
- **Gemini 3.1 Pro (via Antigravity):** Scaffolded the Next.js boilerplate, generated the Shadcn components setup, drafted the Mongoose models, built the API routes, and styled the Tailwind UI.
- **Groq API:** Used as the core intelligence engine within the application for lead analysis, call prep, debriefs, and chat.
