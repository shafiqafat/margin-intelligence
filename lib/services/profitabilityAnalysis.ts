import { getMarginAnalysis } from "@/lib/services/margins";

export async function getProfitabilityAnalysis(businessId: string) {
  const marginAnalysis = await getMarginAnalysis(businessId);

  const productsWithSales = marginAnalysis.products.filter(
    (product) => product.netRevenue > 0,
  );

  const rankedProducts = [...productsWithSales].sort(
    (a, b) => b.contribution - a.contribution,
  );

  const profitableProducts = productsWithSales.filter(
    (product) => product.contribution > 0,
  );

  const lossMakingProducts = productsWithSales.filter(
    (product) => product.contribution < 0,
  );

  const totalContribution = productsWithSales.reduce(
    (total, product) => total + product.contribution,
    0,
  );

  const mostProfitableProduct = rankedProducts[0] ?? null;

  const biggestLossProduct =
    [...productsWithSales].sort((a, b) => a.contribution - b.contribution)[0] ??
    null;

  return {
    products: rankedProducts,

    totals: {
      totalRevenue: marginAnalysis.totals.totalRevenue,

      totalContribution,

      overallMargin: marginAnalysis.totals.overallMargin,

      profitableProducts: profitableProducts.length,

      lossMakingProducts: lossMakingProducts.length,
    },

    mostProfitableProduct,
    biggestLossProduct,
  };
}
