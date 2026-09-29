export const W = { 
  intent_strength: 0.30, 
  timeline_urgency: 0.25, 
  budget_fit: 0.25,
  engagement_quality: 0.10, 
  information_completeness: 0.10 
};

export interface Scores {
  intent_strength: number;
  timeline_urgency: number;
  budget_fit: number;
  engagement_quality: number;
  information_completeness: number;
}

export function calculatePriority(s: Scores, daysSinceContact = 0) {
  const raw = Object.entries(W).reduce((a, [k, w]) => a + (s as any)[k] * w, 0) * 10; // 0-100
  const decay = Math.min(15, Math.max(0, daysSinceContact - 1) * 3);                  // staleness penalty
  const score = Math.round(Math.max(0, raw - decay));
  const tier = score >= 70 ? "hot" : score >= 45 ? "warm" : "cold";
  return { score, tier, atRisk: tier === "hot" && daysSinceContact >= 3 };
}
