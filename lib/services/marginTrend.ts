import { getProducts } from "@/lib/services/products";
import { getSaleItems } from "@/lib/services/sales";
import { getReturns } from "@/lib/services/returns";
import { getExpenses } from "@/lib/services/expenses";
import { getProductTrueCosts } from "@/lib/services/cost";

import { calculateMarginTrend } from "@/domain/cost/calculateMarginTrend";
import type { DashboardRange } from "@/types/dashboard";
import { getDateRange } from "@/lib/utils/dateRange";

export async function getMarginTrend(
  businessId: string,
  range: DashboardRange,
  timezone: string,
) {
  const [products, saleItems, returns, expenses, trueCosts] = await Promise.all(
    [
      getProducts(businessId),
      getSaleItems(businessId),
      getReturns(businessId),
      getExpenses(businessId),
      getProductTrueCosts(businessId),
    ],
  );

  const dateRange = getDateRange(range, timezone);

  const trendProducts = products.map((product) => {
    const trueCost = trueCosts.find((item) => item.productId === product.id);

    return {
      productId: product.id,
      trueUnitCost: trueCost?.trueCostPerUnit ?? 0,
      targetMargin: product.target_margin,
    };
  });

  return {
    ...calculateMarginTrend({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      products: trendProducts,
      saleItems,
      returns,
      expenses,
    }),
    dateRange,
  };
}
