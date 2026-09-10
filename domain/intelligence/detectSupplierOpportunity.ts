type SupplierPurchase = {
  supplierId: string;
  supplierName: string;
  quantity: number;
  unitCost: number;
};

export type SupplierOpportunityFinding = {
  type: "supplier_opportunity";
  severity: "opportunity";
  productId: string;
  title: string;
  description: string;
  financialImpact: number;
  currentSupplierName: string;
  currentAverageCost: number;
  betterSupplierName: string;
  betterAverageCost: number;
  savingsPercentage: number;
};

const MINIMUM_PURCHASES_PER_SUPPLIER = 2;
const MINIMUM_SAVINGS_PERCENT = 5;
const MINIMUM_ABSOLUTE_SAVINGS = 10;

export function detectSupplierOpportunity(
  productId: string,
  productName: string,
  purchases: SupplierPurchase[],
): SupplierOpportunityFinding | null {
  const supplierGroups = new Map<
    string,
    {
      supplierName: string;
      purchases: SupplierPurchase[];
    }
  >();

  for (const purchase of purchases) {
    const existing = supplierGroups.get(purchase.supplierId);

    if (existing) {
      existing.purchases.push(purchase);
    } else {
      supplierGroups.set(purchase.supplierId, {
        supplierName: purchase.supplierName,
        purchases: [purchase],
      });
    }
  }

  const supplierAverages = Array.from(supplierGroups.entries())
    .filter(
      ([, supplier]) =>
        supplier.purchases.length >= MINIMUM_PURCHASES_PER_SUPPLIER,
    )
    .map(([supplierId, supplier]) => {
      const totalQuantity = supplier.purchases.reduce(
        (total, purchase) => total + purchase.quantity,
        0,
      );

      const totalCost = supplier.purchases.reduce(
        (total, purchase) => total + purchase.quantity * purchase.unitCost,
        0,
      );

      return {
        supplierId,
        supplierName: supplier.supplierName,
        averageCost: totalQuantity > 0 ? totalCost / totalQuantity : 0,
        totalQuantity,
      };
    })
    .filter((supplier) => supplier.averageCost > 0);

  if (supplierAverages.length < 2) {
    return null;
  }

  const sorted = [...supplierAverages].sort(
    (a, b) => a.averageCost - b.averageCost,
  );

  const betterSupplier = sorted[0];
  const expensiveSupplier = sorted[sorted.length - 1];

  const absoluteSavings =
    expensiveSupplier.averageCost - betterSupplier.averageCost;

  if (absoluteSavings < MINIMUM_ABSOLUTE_SAVINGS) {
    return null;
  }

  const savingsPercentage =
    (absoluteSavings / expensiveSupplier.averageCost) * 100;

  if (savingsPercentage < MINIMUM_SAVINGS_PERCENT) {
    return null;
  }

  const estimatedSavings = absoluteSavings * expensiveSupplier.totalQuantity;

  return {
    type: "supplier_opportunity",
    severity: "opportunity",
    productId,

    title: `${productName} may have a lower-cost supplier`,

    description: `${betterSupplier.supplierName} has an average purchase cost of ${betterSupplier.averageCost.toFixed(
      2,
    )}, compared with ${expensiveSupplier.averageCost.toFixed(
      2,
    )} from ${expensiveSupplier.supplierName}.`,

    financialImpact: estimatedSavings,

    currentSupplierName: expensiveSupplier.supplierName,

    currentAverageCost: expensiveSupplier.averageCost,

    betterSupplierName: betterSupplier.supplierName,

    betterAverageCost: betterSupplier.averageCost,

    savingsPercentage,
  };
}
