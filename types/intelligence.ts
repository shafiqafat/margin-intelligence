export type InsightSeverity = "info" | "warning" | "risk" | "opportunity";

export type InsightExplanation = {
  whatHappened: string;
  whyItMatters: string;
  whatToInvestigate: string;
};

export type BaseInsightFinding = {
  type: string;
  severity: InsightSeverity;
  productId: string;
  title: string;
  description: string;
  financialImpact: number;
  explanation?: InsightExplanation;
};

export type InsightFinding = BaseInsightFinding & Record<string, unknown>;
