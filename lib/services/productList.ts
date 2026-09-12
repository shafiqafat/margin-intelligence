import { getProducts } from "@/lib/services/products";
import { getPurchaseItems } from "@/lib/services/purchases";
import { getSaleItems } from "@/lib/services/sales";
import { getReturns } from "@/lib/services/returns";
import { getExpenses } from "@/lib/services/expenses";
import { getCostAllocations } from "@/lib/services/allocations";

import { calculateProductProfitability } from "@/domain/cost/calculateProductProfitability";

export async function getProductListData(businessId: string) {
  const [products, purchaseItems, saleItems, returns, expenses, allocations] =
    await Promise.all([
      getProducts(businessId),
      getPurchaseItems(businessId),
      getSaleItems(businessId),
      getReturns(businessId),
      getExpenses(businessId),
      getCostAllocations(businessId),
    ]);

  return products.map((product) => {
    const profitability = calculateProductProfitability({
      product,
      purchaseItems,
      saleItems,
      returns,
      expenses,
      allocations,
    });

    return {
      ...product,
      profitability,
    };
  });
}
