export const INSIGHT_STATUSES = [
  "new",
  "viewed",
  "investigating",
  "action_taken",
  "resolved",
] as const;

export type InsightStatus = (typeof INSIGHT_STATUSES)[number];
