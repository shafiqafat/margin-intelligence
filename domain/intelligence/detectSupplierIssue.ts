type SupplierPurchase = {
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  quantity: number;
  unitCost: number;
};

export type SupplierIssueFinding = {
  type: "supplier_issue";
  severity: "warning" | "risk";
  productId: string;
  title: string;
  description: string;
  financialImpact: number;
  supplierName: string;
  historicalAverageCost: number;
  recentAverageCost: number;
  increasePercentage: number;
};

const MINIMUM_PURCHASES = 4;
const MINIMUM_INCREASE_PERCENT = 15;

export function detectSupplierIssue(
  productId: string,
  productName: string,
  purchases: SupplierPurchase[],
): SupplierIssueFinding | null {
  const supplierGroups = new Map<string, SupplierPurchase[]>();

  for (const purchase of purchases) {
    const existing = supplierGroups.get(purchase.supplierId);

    if (existing) {
      existing.push(purchase);
    } else {
      supplierGroups.set(purchase.supplierId, [purchase]);
    }
  }

  const candidates = Array.from(supplierGroups.entries()).filter(
    ([, supplierPurchases]) => supplierPurchases.length >= MINIMUM_PURCHASES,
  );

  if (candidates.length === 0) {
    return null;
  }

  let strongestFinding: SupplierIssueFinding | null = null;

  for (const [, supplierPurchases] of candidates) {
    const sorted = [...supplierPurchases].sort(
      (a, b) =>
        new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime(),
    );

    const midpoint = Math.floor(sorted.length / 2);

    const historicalPurchases = sorted.slice(0, midpoint);

    const recentPurchases = sorted.slice(midpoint);

    const calculateWeightedAverage = (records: SupplierPurchase[]) => {
      const quantity = records.reduce(
        (total, record) => total + record.quantity,
        0,
      );

      if (quantity <= 0) {
        return 0;
      }

      const cost = records.reduce(
        (total, record) => total + record.quantity * record.unitCost,
        0,
      );

      return cost / quantity;
    };

    const historicalAverageCost = calculateWeightedAverage(historicalPurchases);

    const recentAverageCost = calculateWeightedAverage(recentPurchases);

    if (historicalAverageCost <= 0) {
      continue;
    }

    const increasePercentage =
      ((recentAverageCost - historicalAverageCost) / historicalAverageCost) *
      100;

    if (increasePercentage < MINIMUM_INCREASE_PERCENT) {
      continue;
    }

    const severity = increasePercentage >= 25 ? "risk" : "warning";

    const recentQuantity = recentPurchases.reduce(
      (total, purchase) => total + purchase.quantity,
      0,
    );

    const financialImpact =
      (recentAverageCost - historicalAverageCost) * recentQuantity;

    const finding: SupplierIssueFinding = {
      type: "supplier_issue",
      severity,
      productId,

      title: `${productName} cost is rising with ${supplierPurchases[0].supplierName}`,

      description: `Recent average purchase cost is ${increasePercentage.toFixed(
        1,
      )}% higher than the supplier's earlier average.`,

      financialImpact,

      supplierName: supplierPurchases[0].supplierName,

      historicalAverageCost,

      recentAverageCost,

      increasePercentage,
    };

    if (
      !strongestFinding ||
      finding.increasePercentage > strongestFinding.increasePercentage
    ) {
      strongestFinding = finding;
    }
  }

  return strongestFinding;
}
