type PurchaseItem = {
  product_id: string;
  quantity: number;
  unit_cost: number;
};

type CostAllocation = {
  product_id: string;
  amount: number;
};

type ProductTrueCost = {
  productId: string;
  purchasedQuantity: number;
  purchaseCost: number;
  allocatedDirectCosts: number;
  totalTrueCost: number;
  trueCostPerUnit: number;
};

/*
 * Returns the true cost per unit.
 *
 * This function is used by the existing
 * Product Profitability calculation, so it
 * must return a number.
 */
export function calculateTrueUnitCost(
  productId: string,
  purchaseItems: PurchaseItem[],
  allocations: CostAllocation[],
): number {
  const productPurchases = purchaseItems.filter(
    (item) => item.product_id === productId,
  );

  const purchasedQuantity = productPurchases.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  if (purchasedQuantity === 0) {
    return 0;
  }

  const purchaseCost = productPurchases.reduce(
    (total, item) => total + item.quantity * item.unit_cost,
    0,
  );

  const allocatedDirectCosts = allocations
    .filter((allocation) => allocation.product_id === productId)
    .reduce((total, allocation) => total + allocation.amount, 0);

  const totalTrueCost = purchaseCost + allocatedDirectCosts;

  return totalTrueCost / purchasedQuantity;
}

/*
 * Returns the complete true-cost breakdown
 * for a product.
 */
export function calculateProductTrueCost(
  productId: string,
  purchaseItems: PurchaseItem[],
  allocations: CostAllocation[],
): ProductTrueCost {
  const productPurchases = purchaseItems.filter(
    (item) => item.product_id === productId,
  );

  const purchasedQuantity = productPurchases.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const purchaseCost = productPurchases.reduce(
    (total, item) => total + item.quantity * item.unit_cost,
    0,
  );

  const allocatedDirectCosts = allocations
    .filter((allocation) => allocation.product_id === productId)
    .reduce((total, allocation) => total + allocation.amount, 0);

  const totalTrueCost = purchaseCost + allocatedDirectCosts;

  const trueCostPerUnit =
    purchasedQuantity > 0 ? totalTrueCost / purchasedQuantity : 0;

  return {
    productId,
    purchasedQuantity,
    purchaseCost,
    allocatedDirectCosts,
    totalTrueCost,
    trueCostPerUnit,
  };
}
