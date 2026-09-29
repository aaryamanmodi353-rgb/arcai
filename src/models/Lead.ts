import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  location: string;
  requirement: string;
  budget: string;
  timeline: string;
  message: string;
  analysis: {
    summary: string;
    intent: string;
    intent_reasoning: string;
    key_requirements: string[];
    objections: {
      concern: string;
      evidence: string;
      severity: string;
      resolved?: boolean;
    }[];
    next_action: string;
    suggested_response: string;
    scores: {
      intent_strength: number;
      budget_fit: number;
      timeline_urgency: number;
      information_completeness: number;
      engagement_quality: number;
    };
    score_rationale: string;
    confidence: string;
    missing_info: string[];
  };
  priority: {
    score: number;
    tier: string;
    atRisk: boolean;
  };
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  debriefHistory: {
    notes: string;
    timestamp: Date;
    what_changed: string[];
  }[];
  status?: string;
  closeReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  requirement: { type: String, required: true },
  budget: { type: String, required: true },
  timeline: { type: String, required: true },
  message: { type: String, required: true },
  analysis: {
    summary: { type: String },
    intent: { type: String },
    intent_reasoning: { type: String },
    key_requirements: [{ type: String }],
    objections: [{
      concern: { type: String },
      evidence: { type: String },
      severity: { type: String },
      resolved: { type: Boolean, default: false }
    }],
    next_action: { type: String },
    suggested_response: { type: String },
    scores: {
      intent_strength: { type: Number, default: 0 },
      budget_fit: { type: Number, default: 0 },
      timeline_urgency: { type: Number, default: 0 },
      information_completeness: { type: Number, default: 0 },
      engagement_quality: { type: Number, default: 0 }
    },
    score_rationale: { type: String },
    confidence: { type: String },
    missing_info: [{ type: String }]
  },
  priority: {
    score: { type: Number, default: 0 },
    tier: { type: String, default: 'cold' },
    atRisk: { type: Boolean, default: false }
  },
  chatHistory: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: { type: String }
  }],
  debriefHistory: [{
    notes: { type: String },
    timestamp: { type: Date, default: Date.now },
    what_changed: [{ type: String }]
  }],
  status: { type: String, default: 'open' },
  closeReason: { type: String }
}, { timestamps: true });

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
