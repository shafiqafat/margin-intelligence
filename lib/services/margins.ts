import { getProducts } from "@/lib/services/products";
import { getPurchaseItems } from "@/lib/services/purchases";
import { getSaleItems } from "@/lib/services/sales";
import { getReturns } from "@/lib/services/returns";
import { getExpenses } from "@/lib/services/expenses";
import { getCostAllocations } from "@/lib/services/allocations";

import { calculateProductProfitability } from "@/domain/cost/calculateProductProfitability";

export async function getMarginAnalysis(businessId: string) {
  const [products, purchaseItems, saleItems, returns, expenses, allocations] =
    await Promise.all([
      getProducts(businessId),
      getPurchaseItems(businessId),
      getSaleItems(businessId),
      getReturns(businessId),
      getExpenses(businessId),
      getCostAllocations(businessId),
    ]);

  const profitability = products.map((product) => {
    const result = calculateProductProfitability({
      product,
      purchaseItems,
      saleItems,
      returns,
      expenses,
      allocations,
    });

    return {
      ...result,
      sellingPrice: product.selling_price,
      targetMargin: product.target_margin,
      status: product.status,
    };
  });

  const productsWithSales = profitability.filter(
    (product) => product.netRevenue > 0,
  );

  const totalRevenue = productsWithSales.reduce(
    (total, product) => total + product.netRevenue,
    0,
  );

  const totalContribution = productsWithSales.reduce(
    (total, product) => total + product.contribution,
    0,
  );

  const overallMargin =
    totalRevenue > 0 ? (totalContribution / totalRevenue) * 100 : 0;

  const averageMargin =
    productsWithSales.length > 0
      ? productsWithSales.reduce(
          (total, product) => total + product.contributionMargin,
          0,
        ) / productsWithSales.length
      : 0;

  const belowTarget = productsWithSales.filter(
    (product) => product.contributionMargin < product.targetMargin,
  );

  const aboveTarget = productsWithSales.filter(
    (product) => product.contributionMargin >= product.targetMargin,
  );

  return {
    products: profitability,
    totals: {
      totalRevenue,
      totalContribution,
      overallMargin,
      averageMargin,
      productsWithSales: productsWithSales.length,
      belowTarget: belowTarget.length,
      aboveTarget: aboveTarget.length,
    },
  };
}
