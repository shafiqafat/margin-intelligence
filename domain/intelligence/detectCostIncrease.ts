type PurchaseRecord = {
  purchaseDate: string;
  quantity: number;
  unitCost: number;
};

export type CostIncreaseFinding = {
  type: "cost_increase";
  severity: "warning" | "risk";
  productId: string;
  title: string;
  description: string;
  financialImpact: number;
  increasePercentage: number;
  previousUnitCost: number;
  recentUnitCost: number;
};

const MINIMUM_INCREASE_PERCENT = 10;

export function detectCostIncrease(
  productId: string,
  productName: string,
  purchases: PurchaseRecord[],
): CostIncreaseFinding | null {
  if (purchases.length < 2) {
    return null;
  }

  const sortedPurchases = [...purchases].sort(
    (a, b) =>
      new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime(),
  );

  const midpoint = Math.floor(sortedPurchases.length / 2);

  const previousPurchases = sortedPurchases.slice(0, midpoint);

  const recentPurchases = sortedPurchases.slice(midpoint);

  if (previousPurchases.length === 0 || recentPurchases.length === 0) {
    return null;
  }

  const calculateAverageCost = (records: PurchaseRecord[]) => {
    const totalQuantity = records.reduce(
      (total, record) => total + record.quantity,
      0,
    );

    if (totalQuantity <= 0) {
      return 0;
    }

    const totalCost = records.reduce(
      (total, record) => total + record.quantity * record.unitCost,
      0,
    );

    return totalCost / totalQuantity;
  };

  const previousUnitCost = calculateAverageCost(previousPurchases);

  const recentUnitCost = calculateAverageCost(recentPurchases);

  if (previousUnitCost <= 0) {
    return null;
  }

  const increasePercentage =
    ((recentUnitCost - previousUnitCost) / previousUnitCost) * 100;

  if (increasePercentage < MINIMUM_INCREASE_PERCENT) {
    return null;
  }

  const severity = increasePercentage >= 20 ? "risk" : "warning";

  return {
    type: "cost_increase",
    severity,
    productId,
    title: `${productName} purchase cost increased`,
    description: `Recent average purchase cost is ${increasePercentage.toFixed(
      1,
    )}% higher than the previous period.`,
    financialImpact:
      (recentUnitCost - previousUnitCost) *
      recentPurchases.reduce((total, record) => total + record.quantity, 0),
    increasePercentage,
    previousUnitCost,
    recentUnitCost,
  };
}
