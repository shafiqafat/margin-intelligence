type PurchaseItem = {
  quantity: number;
  unit_cost: number;
};

export function calculateWeightedAverageUnitCost(
  purchaseItems: PurchaseItem[],
) {
  if (purchaseItems.length === 0) {
    return 0;
  }

  const totalQuantity = purchaseItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  if (totalQuantity === 0) {
    return 0;
  }

  const totalCost = purchaseItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0,
  );

  return totalCost / totalQuantity;
}
