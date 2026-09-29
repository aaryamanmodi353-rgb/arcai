import { z } from 'zod';
import { SchemaType } from '@google/generative-ai';

// We use Zod for our own validation but map it to Gemini's Schema format
export const aiAnalysisSchemaObj = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING, description: "2 sentences maximum. Who they are, what they want, how urgent." },
    intent: { type: SchemaType.STRING, description: 'ready_to_buy, actively_comparing, early_research, investor, unclear' },
    intent_reasoning: { type: SchemaType.STRING, description: "one sentence citing evidence from the message" },
    key_requirements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "array of short strings (max 6), each 8 words or fewer" },
    objections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          concern: { type: SchemaType.STRING },
          evidence: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING, description: 'low, medium, high' }
        },
        required: ["concern", "evidence", "severity"]
      }
    },
    next_action: { type: SchemaType.STRING, description: "one imperative sentence starting with a verb" },
    suggested_response: { type: SchemaType.STRING, description: "60-120 words, warm and professional" },
    scores: {
      type: SchemaType.OBJECT,
      properties: {
        intent_strength: { type: SchemaType.INTEGER, description: "0-10" },
        budget_fit: { type: SchemaType.INTEGER, description: "0-10" },
        timeline_urgency: { type: SchemaType.INTEGER, description: "0-10" },
        information_completeness: { type: SchemaType.INTEGER, description: "0-10" },
        engagement_quality: { type: SchemaType.INTEGER, description: "0-10" }
      },
      required: ["intent_strength", "budget_fit", "timeline_urgency", "information_completeness", "engagement_quality"]
    },
    score_rationale: { type: SchemaType.STRING, description: "one sentence explaining strongest positive and biggest drag" },
    confidence: { type: SchemaType.STRING, description: 'high, medium, low' },
    missing_info: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "max 3 questions" }
  },
  required: [
    "summary", "intent", "intent_reasoning", "key_requirements", "objections", 
    "next_action", "suggested_response", "scores", "score_rationale", "confidence", "missing_info"
  ]
};

export const callBriefSchemaObj = {
  type: SchemaType.OBJECT,
  properties: {
    opener: { type: SchemaType.STRING, description: "max 25 words" },
    discovery_questions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "exactly 3" },
    likely_objections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          objection: { type: SchemaType.STRING },
          suggested_rebuttal: { type: SchemaType.STRING, description: "max 30 words" }
        },
        required: ["objection", "suggested_rebuttal"]
      },
      description: "max 3"
    },
    avoid_saying: { type: SchemaType.STRING, description: "one line" },
    goal_of_call: { type: SchemaType.STRING, description: "one line" }
  },
  required: ["opener", "discovery_questions", "likely_objections", "avoid_saying", "goal_of_call"]
};

export const debriefSchemaObj = {
  type: SchemaType.OBJECT,
  properties: {
    updated_requirements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    updated_objections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          concern: { type: SchemaType.STRING },
          evidence: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          resolved: { type: SchemaType.BOOLEAN }
        },
        required: ["concern", "evidence", "severity"]
      }
    },
    updated_scores: {
      type: SchemaType.OBJECT,
      properties: {
        intent_strength: { type: SchemaType.INTEGER },
        budget_fit: { type: SchemaType.INTEGER },
        timeline_urgency: { type: SchemaType.INTEGER },
        information_completeness: { type: SchemaType.INTEGER },
        engagement_quality: { type: SchemaType.INTEGER }
      },
      required: ["intent_strength", "budget_fit", "timeline_urgency", "information_completeness", "engagement_quality"]
    },
    what_changed: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "max 4, start with +, -, ~" },
    next_action: { type: SchemaType.STRING },
    follow_up_message: { type: SchemaType.STRING }
  },
  required: ["updated_requirements", "updated_objections", "updated_scores", "what_changed", "next_action", "follow_up_message"]
};
