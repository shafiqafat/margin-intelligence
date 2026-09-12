export type InsightSeverity = "info" | "warning" | "risk" | "opportunity";

export type InsightExplanation = {
  whatHappened: string;
  whyItMatters: string;
  whatToInvestigate: string;

  primaryDriver?: InsightDriver;
  driverReason?: string;
};

export type InsightDriver =
  | "purchase_cost"
  | "direct_costs"
  | "returns"
  | "selling_price"
  | "multiple_factors"
  | "insufficient_data";

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
