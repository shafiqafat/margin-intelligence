export type InsightSeverity = "info" | "warning" | "risk" | "opportunity";

export type InsightFinding = {
  type: string;
  severity: InsightSeverity;
  productId: string;
  title: string;
  description: string;
  financialImpact: number;
};
