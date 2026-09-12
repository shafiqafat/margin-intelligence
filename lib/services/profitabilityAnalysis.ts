import { getProducts } from "@/lib/services/products";
import { getPurchaseItems } from "@/lib/services/purchases";
import { getSaleItems } from "@/lib/services/sales";
import { getReturns } from "@/lib/services/returns";
import { getExpenses } from "@/lib/services/expenses";
import { getCostAllocations } from "@/lib/services/allocations";

import { calculateProductProfitability } from "@/domain/cost/calculateProductProfitability";
import type { DashboardRange } from "@/types/dashboard";
import { getDateRange } from "@/lib/utils/dateRange";

export type ProfitabilityAnalysisData = {
  range: DashboardRange;

  revenue: number;
  contribution: number;
  contributionMargin: number;

  previousRevenue: number;
  previousContribution: number;
  previousContributionMargin: number;

  revenueChange: number;
  contributionChange: number;
  marginChange: number;

  products: ReturnType<typeof calculateProductProfitability>[];
};

export async function getProfitabilityAnalysis(
  businessId: string,
  range: DashboardRange,
  timezone: string,
): Promise<ProfitabilityAnalysisData> {
  const dates = getDateRange(range, timezone);

  const [products, purchaseItems, saleItems, returns, expenses, allocations] =
    await Promise.all([
      getProducts(businessId),
      getPurchaseItems(businessId),
      getSaleItems(businessId),
      getReturns(businessId),
      getExpenses(businessId),
      getCostAllocations(businessId),
    ]);

  function getSaleDate(sale: (typeof saleItems)[number]["sale"]) {
    if (Array.isArray(sale)) {
      return sale[0]?.sale_date ?? null;
    }

    return sale?.sale_date ?? null;
  }

  function filterPeriod(startDate: string, endDate: string) {
    const periodSaleItems = saleItems.filter((item) => {
      const saleDate = getSaleDate(item.sale);

      return saleDate !== null && saleDate >= startDate && saleDate <= endDate;
    });

    const periodReturns = returns.filter(
      (item) => item.return_date >= startDate && item.return_date <= endDate,
    );

    const periodExpenses = expenses.filter(
      (item) => item.expense_date >= startDate && item.expense_date <= endDate,
    );

    return {
      saleItems: periodSaleItems,
      returns: periodReturns,
      expenses: periodExpenses,
    };
  }

  function calculatePeriod(startDate: string, endDate: string) {
    const period = filterPeriod(startDate, endDate);

    const results = products.map((product) =>
      calculateProductProfitability({
        product,
        purchaseItems,
        saleItems: period.saleItems,
        returns: period.returns,
        expenses: period.expenses,
        allocations,
      }),
    );

    const revenue = results.reduce(
      (total, result) => total + result.netRevenue,
      0,
    );

    const contribution = results.reduce(
      (total, result) => total + result.contribution,
      0,
    );

    const contributionMargin = revenue > 0 ? (contribution / revenue) * 100 : 0;

    return {
      results,
      revenue,
      contribution,
      contributionMargin,
    };
  }

  const current = calculatePeriod(dates.startDate, dates.endDate);

  const previous = calculatePeriod(
    dates.previousStartDate,
    dates.previousEndDate,
  );

  const productsWithSales = current.results
    .filter((result) => result.netRevenue > 0)
    .sort((a, b) => b.contribution - a.contribution);

  return {
    range,

    revenue: current.revenue,
    contribution: current.contribution,
    contributionMargin: current.contributionMargin,

    previousRevenue: previous.revenue,
    previousContribution: previous.contribution,
    previousContributionMargin: previous.contributionMargin,

    revenueChange: current.revenue - previous.revenue,

    contributionChange: current.contribution - previous.contribution,

    marginChange: current.contributionMargin - previous.contributionMargin,

    products: productsWithSales,
  };
}
