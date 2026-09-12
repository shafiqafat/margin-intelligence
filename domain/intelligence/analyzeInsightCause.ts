export type ProfitabilityEvidence = {
  netRevenue: number;
  netUnitsSold: number;
  purchaseCost: number;
  allocatedDirectCosts: number;
  directExpenses: number;
  returnCosts: number;
  trueUnitCost: number;
  contribution: number;
  contributionMargin: number;
  targetMargin: number;
  marginGap: number;
};

export type InsightDriver =
  | "purchase_cost"
  | "direct_costs"
  | "returns"
  | "selling_price"
  | "multiple_factors"
  | "insufficient_data";

export type CauseAnalysis = {
  primaryDriver: InsightDriver;
  reason: string;
};

export function analyzeInsightCause(
  evidence: ProfitabilityEvidence,
): CauseAnalysis {
  if (evidence.netRevenue <= 0 || evidence.netUnitsSold <= 0) {
    return {
      primaryDriver: "insufficient_data",
      reason:
        "There is not enough sales activity to confidently determine the main cause.",
    };
  }

  const averageRevenuePerUnit = evidence.netRevenue / evidence.netUnitsSold;

  const purchaseCostPerUnit = evidence.purchaseCost / evidence.netUnitsSold;

  const allocatedDirectCostPerUnit =
    evidence.allocatedDirectCosts / evidence.netUnitsSold;

  const directExpensePerUnit = evidence.directExpenses / evidence.netUnitsSold;

  const returnCostPerUnit = evidence.returnCosts / evidence.netUnitsSold;

  const costDrivers = [
    {
      driver: "purchase_cost" as const,
      amount: purchaseCostPerUnit,
    },
    {
      driver: "direct_costs" as const,
      amount: allocatedDirectCostPerUnit + directExpensePerUnit,
    },
    {
      driver: "returns" as const,
      amount: returnCostPerUnit,
    },
  ];

  const largestCostDriver = [...costDrivers].sort(
    (a, b) => b.amount - a.amount,
  )[0];

  const sellingPricePressure = averageRevenuePerUnit - evidence.trueUnitCost;

  if (sellingPricePressure <= 0) {
    return {
      primaryDriver: "selling_price",
      reason:
        "The realized revenue per unit is not covering the true cost per unit.",
    };
  }

  if (largestCostDriver && largestCostDriver.amount > 0) {
    const totalCostPerUnit =
      evidence.trueUnitCost + directExpensePerUnit + returnCostPerUnit;

    if (largestCostDriver.amount / Math.max(totalCostPerUnit, 1) >= 0.5) {
      const reasons = {
        purchase_cost:
          "Purchase cost is the largest cost component affecting unit economics.",
        direct_costs:
          "Direct costs are a major contributor to the product's weak margin.",
        returns:
          "Return-related costs are materially reducing the product's contribution.",
      };

      return {
        primaryDriver: largestCostDriver.driver,
        reason: reasons[largestCostDriver.driver],
      };
    }
  }

  return {
    primaryDriver: "multiple_factors",
    reason:
      "No single cost factor dominates the margin gap; several factors are contributing.",
  };
}
