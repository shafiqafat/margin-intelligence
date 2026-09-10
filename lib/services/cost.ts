import { getProducts } from "@/lib/services/products";
import { getPurchaseItems } from "@/lib/services/purchases";
import { getCostAllocations } from "@/lib/services/allocations";
import { getReturns } from "@/lib/services/returns";

import { calculateProductTrueCost } from "@/domain/cost/calculateTrueCost";
import { calculateProductReturnImpact } from "@/domain/cost/calculateReturns";

export async function getProductTrueCosts(businessId: string) {
  const [products, purchaseItems, allocations, returns] = await Promise.all([
    getProducts(businessId),
    getPurchaseItems(businessId),
    getCostAllocations(businessId),
    getReturns(businessId),
  ]);

  return products.map((product) => {
    const trueCost = calculateProductTrueCost(
      product.id,
      purchaseItems,
      allocations,
    );

    const returnImpact = calculateProductReturnImpact(product.id, returns);

    return {
      ...product,
      ...trueCost,
      ...returnImpact,
    };
  });
}
export async function getCostAnalysis(businessId: string) {
  const products = await getProductTrueCosts(businessId);

  const totalPurchaseCost = products.reduce(
    (total, product) => total + product.purchaseCost,
    0,
  );

  const totalDirectCosts = products.reduce(
    (total, product) => total + product.allocatedDirectCosts,
    0,
  );

  const totalTrueCost = products.reduce(
    (total, product) => total + product.totalTrueCost,
    0,
  );

  const totalPurchasedQuantity = products.reduce(
    (total, product) => total + product.purchasedQuantity,
    0,
  );

  const totalReturnCosts = products.reduce(
    (total, product) => total + product.returnCosts,
    0,
  );

  const totalRefundedRevenue = products.reduce(
    (total, product) => total + product.refundedRevenue,
    0,
  );

  const averageTrueCost =
    totalPurchasedQuantity > 0 ? totalTrueCost / totalPurchasedQuantity : 0;

  return {
    products,
    totals: {
      purchaseCost: totalPurchaseCost,
      directCosts: totalDirectCosts,
      trueCost: totalTrueCost,
      purchasedQuantity: totalPurchasedQuantity,
      averageTrueCost,
      returnCosts: totalReturnCosts,
      refundedRevenue: totalRefundedRevenue,
    },
  };
}