import { getProducts } from "@/lib/services/products";
import type { DashboardRange } from "@/types/dashboard";
import { getDashboardProfitability } from "@/lib/services/dashboardProfitability";

export async function getDashboardData(
  businessId: string,
  range: DashboardRange,
  timezone: string,
) {
  const products = await getProducts(businessId);

  const profitability = await getDashboardProfitability(
    businessId,
    range,
    timezone,
  );

  const revenue = profitability.reduce(
    (total, product) => total + product.netRevenue,
    0,
  );

  const trueCost = profitability.reduce(
    (total, product) => total + product.trueUnitCost * product.netUnitsSold,
    0,
  );

  const contribution = profitability.reduce(
    (total, product) => total + product.contribution,
    0,
  );

  const contributionMargin = revenue > 0 ? (contribution / revenue) * 100 : 0;

  return {
    range,
    revenue,
    trueCost,
    contribution,
    contributionMargin,
    products: profitability.map((product) => {
      const sourceProduct = products.find(
        (item) => item.id === product.productId,
      );

      return {
        ...product,
        sku: sourceProduct?.sku ?? null,
      };
    }),
  };
}
