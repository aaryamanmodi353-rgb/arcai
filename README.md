<div align="center">
  <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80" alt="Arc AI Cover" width="100%" style="border-radius: 12px; margin-bottom: 20px;">

  # Æ Arc AI
  **A Next-Generation, AI-Powered Real Estate Deal Room & Customer Portal**

  <p>
    <img src="https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Groq-AI-F3BD65?style=for-the-badge&logo=openai" alt="Groq AI" />
    <img src="https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=react" alt="Recharts" />
  </p>
</div>

---

## 🌟 Overview

Arc AI is a premium, AI-driven real estate CRM and property exploration platform. It completely reimagines the interaction between real estate brokers and high-net-worth clients by utilizing large language models to automate lead scoring, match properties to complex customer requests, and track pipeline momentum in real-time.

Built with a sleek, high-end "glassmorphic" design system, Arc AI provides a seamless two-sided experience:
- **For Admins:** A powerful "Deal Room" to prioritize hot leads, dispatch AI agents, and monitor pipeline health.
- **For Customers:** A luxurious portal to explore verified inventory, submit AI-assisted global requests, and track application timelines.

---

## ✨ Core Features

### 🏢 The Admin Deal Room
- **AI Lead Scoring:** Every customer interaction is automatically analyzed by AI, assigning a "Hot", "Warm", or "Cold" tier and a priority score (0-99).
- **Dynamic Pipeline:** Instantly filter between *All*, *Hot to Call*, and *At Risk* leads.
- **Actionable Insights:** View AI-generated summaries, intent analyses, missing information, and suggested next actions for every lead.
- **One-Click Workflows:** Approve deals, close requests, or instruct an autonomous AI Agent to handle customer follow-ups.
- **Momentum Tracking:** Real-time metrics tracking active deals, urgent callbacks, and successfully closed deals.
- **Visual Analytics Dashboard:** A dedicated Recharts-powered dashboard visualizes pipeline momentum, conversion funnels, and real-time active portfolio value dynamically extracted from AI parses.
- **Synthetic AI Market Scraper:** A background Cron job endpoint that connects to Groq AI to synthetically scrape, generate, and ingest uniquely validated luxury properties directly into the live inventory database with server-side smart image assignments.

### 🛋️ The Customer Portal
- **Premium Aesthetics:** Dark mode, glassmorphic UI, dynamic timelines, and fluid animations.
- **Smart Exploration:** Browse curated inventory or use the AI Matchmaker to find properties based on natural language descriptions (e.g., *"I want a 4 BHK facing the sea under 10 Cr"*).
- **Application Tracking:** A live vertical timeline showing real-time updates:
  - 🟢 Application Submitted
  - 🟠 Priority Elevated (Urgent)
  - 🔴 Application Withdrawn / Closed
  - ✨ Deal Approved
- **Urgent Attention System:** Customers can request urgent callbacks, instantly bumping their lead to a "Hot" status on the admin side.

---

## 🚀 Tech Stack

- **Framework:** Next.js (App Router), React
- **Styling:** Tailwind CSS, Lucide Icons, Custom Keyframe Animations
- **Data Visualization:** Recharts (Dynamic Pipeline & Analytics Graphs)
- **Database:** MongoDB via Mongoose
- **AI Integration:** Groq API (LLaMA/Mixtral models) for lightning-fast natural language processing and intent extraction.
- **Authentication:** Custom JWT-based cookie authentication.

---

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aaryamanmodi353-rgb/arcai.git
   cd arcai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Seed the Database**
   To populate the database with initial verified inventory:
   ```bash
   npx ts-node scripts/seed.ts
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   *The application will be available at [http://localhost:3000](http://localhost:3000).*

---

## 🛠️ Project Structure

```text
├── scripts/
│   └── seed.ts                # Database seeding script
├── src/
│   ├── app/
│   │   ├── (admin)/           # Admin Deal Room routes & layout
│   │   ├── api/               # Next.js API Routes (Auth, Leads, Customer, AI)
│   │   ├── customer/          # Customer Portal routes
│   │   ├── login/             # Authentication
│   │   └── signup/            # Registration
│   ├── components/            # Reusable UI components (Icons, Loaders, Sidebar)
│   ├── lib/
│   │   ├── ai/                # AI logic, prompt engineering, and Groq integration
│   │   ├── mongoose.ts        # MongoDB connection handler
│   │   └── auth.ts            # JWT verification utilities
│   └── models/                # Mongoose Schemas (User, Lead, Property)
└── tailwind.config.ts         # Tailwind design tokens
```

---

## 🔒 Security & Roles

The platform enforces strict role-based access control (RBAC):
- `admin`: Granted access to `/` (Deal Room), `/leads/[id]`, and `/inventory`.
- `customer`: Granted access to `/customer`.
Middleware automatically intercepts and redirects unauthorized requests to their respective dashboards or the login page.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome. Feel free to check [issues page](https://github.com/aaryamanmodi353-rgb/arcai/issues) if you want to contribute.

<div align="center">
  <i>"A smarter way to manage residential opportunities."</i>
</div>
