import { config } from 'dotenv';
import mongoose from 'mongoose';
import Lead from '../src/models/Lead';

config({ path: '.env.local' });

const dummyLeads = [
  {
    name: 'Aarav Mehta',
    location: 'Bandra West',
    requirement: '3 BHK',
    budget: '₹ 4.8 Cr',
    timeline: 'Immediately',
    message: 'Shortlisting sea-facing 3 BHKs for a move before Diwali. Precise questions about inventory.',
    priority: {
      score: 92,
      tier: 'hot',
      atRisk: true,
      lastContacted: new Date(Date.now() - 31 * 60 * 60 * 1000)
    },
    analysis: {
      summary: 'Shortlisting sea-facing 3 BHKs for a move before Diwali. Decision maker is engaged; asks precise questions about inventory.',
      intent: 'Ready to buy',
      key_requirements: ['3 BHK', 'Sea-facing'],
      next_action: 'Send inventory list immediately'
    }
  },
  {
    name: 'Jane Doe',
    location: 'Worli',
    requirement: '3 BHK',
    budget: '₹ 2.5 Cr',
    timeline: '1-3 months',
    message: 'Relocating from Singapore in October. Prefers light-filled homes and wants parking confirmed.',
    priority: {
      score: 85,
      tier: 'hot',
      atRisk: false,
      lastContacted: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    analysis: {
      summary: 'Relocating from Singapore in October. Prefers light-filled homes and wants parking confirmed before a viewing.',
      intent: 'Site visit pending',
      key_requirements: ['Natural light', 'Parking'],
      next_action: 'Confirm parking for viewing'
    }
  },
  {
    name: 'Rohan Khanna',
    location: 'Lower Parel',
    requirement: '2 BHK',
    budget: '₹ 3.2 Cr',
    timeline: '3-6 months',
    message: 'Comparing two developments for rental upside. Asked for a clear payment schedule and possession timeline.',
    priority: {
      score: 64,
      tier: 'warm',
      atRisk: false,
      lastContacted: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    analysis: {
      summary: 'Comparing two developments for rental upside. Asked for a clear payment schedule and possession timeline.',
      intent: 'Actively comparing',
      key_requirements: ['Rental yield', 'Clear payment schedule'],
      next_action: 'Provide payment schedules'
    }
  }
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Lead.deleteMany({});
  console.log('Cleared existing leads');

  for (const lead of dummyLeads) {
    await Lead.create({
      ...lead,
      // Mongoose automatically adds createdAt and updatedAt
    });
  }
  
  console.log('Seeded database with dummy leads');
  process.exit(0);
}

seed();
