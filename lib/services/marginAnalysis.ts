import { getProducts } from "@/lib/services/products";
import { getSaleItems } from "@/lib/services/sales";
import { getReturns } from "@/lib/services/returns";
import { getExpenses } from "@/lib/services/expenses";
import { getProductTrueCosts } from "@/lib/services/cost";
import { getDateRange } from "@/lib/utils/dateRange";
import { calculateMarginTrend } from "@/domain/cost/calculateMarginTrend";
import { calculateContributionMargin } from "@/domain/cost/calculateMargin";
import type { DashboardRange } from "@/types/dashboard";

export type MarginProductAnalysis = {
  productId: string;
  productName: string;
  sku: string | null;
  revenue: number;
  contribution: number;
  margin: number;
  targetMargin: number;
  marginGap: number;
  unitsSold: number;
};

export type MarginAnalysisData = {
  range: DashboardRange;
  revenue: number;
  contribution: number;
  margin: number;
  targetMargin: number;
  marginGap: number;
  previousMargin: number;
  marginChange: number;
  trend: ReturnType<typeof calculateMarginTrend>;
  products: MarginProductAnalysis[];
};

export async function getMarginAnalysis(
  businessId: string,
  range: DashboardRange,
  timezone: string,
): Promise<MarginAnalysisData> {
  const { startDate, endDate, previousStartDate, previousEndDate } =
    getDateRange(range, timezone);

  const [products, saleItems, returns, expenses, trueCosts] = await Promise.all(
    [
      getProducts(businessId),
      getSaleItems(businessId),
      getReturns(businessId),
      getExpenses(businessId),
      getProductTrueCosts(businessId),
    ],
  );

  function getSaleDate(sale: (typeof saleItems)[number]["sale"]) {
    if (Array.isArray(sale)) {
      return sale[0]?.sale_date ?? null;
    }

    return sale?.sale_date ?? null;
  }

  function inRange(date: string | null, start: string, end: string) {
    return date ? date >= start && date <= end : false;
  }

  const currentSaleItems = saleItems.filter((item) =>
    inRange(getSaleDate(item.sale), startDate, endDate),
  );

  const previousSaleItems = saleItems.filter((item) =>
    inRange(getSaleDate(item.sale), previousStartDate, previousEndDate),
  );

  const currentReturns = returns.filter(
    (item) => item.return_date >= startDate && item.return_date <= endDate,
  );

  const previousReturns = returns.filter(
    (item) =>
      item.return_date >= previousStartDate &&
      item.return_date <= previousEndDate,
  );

  const currentExpenses = expenses.filter(
    (expense) =>
      expense.expense_date >= startDate && expense.expense_date <= endDate,
  );

  const previousExpenses = expenses.filter(
    (expense) =>
      expense.expense_date >= previousStartDate &&
      expense.expense_date <= previousEndDate,
  );

  function calculatePeriod(
    periodSaleItems: typeof saleItems,
    periodReturns: typeof returns,
    periodExpenses: typeof expenses,
  ) {
    const revenue = periodSaleItems.reduce(
      (total, item) =>
        total +
        Number(item.quantity) * Number(item.unit_price) -
        Number(item.discount),
      0,
    );

    const refundedRevenue = periodReturns.reduce(
      (total, item) => total + Number(item.refund_amount),
      0,
    );

    const netRevenue = revenue - refundedRevenue;

    const costOfUnitsSold = periodSaleItems.reduce((total, item) => {
      const productCost =
        trueCosts.find((product) => product.id === item.product_id)
          ?.trueCostPerUnit ?? 0;

      return total + Number(item.quantity) * productCost;
    }, 0);

    const directExpenses = periodExpenses
      .filter((expense) => expense.product_id !== null)
      .reduce((total, expense) => total + Number(expense.amount), 0);

    const returnCosts = periodReturns.reduce(
      (total, item) =>
        total +
        Number(item.return_shipping_cost) +
        Number(item.restocking_cost),
      0,
    );

    const contribution =
      netRevenue - costOfUnitsSold - directExpenses - returnCosts;

    const margin = calculateContributionMargin(contribution, netRevenue);

    return {
      revenue: netRevenue,
      contribution,
      margin,
    };
  }

  const current = calculatePeriod(
    currentSaleItems,
    currentReturns,
    currentExpenses,
  );

  const previous = calculatePeriod(
    previousSaleItems,
    previousReturns,
    previousExpenses,
  );

  const trend = calculateMarginTrend({
    startDate,
    endDate,
    products: trueCosts.map((product) => {
      const sourceProduct = products.find((item) => item.id === product.id);

      return {
        productId: product.id,
        trueUnitCost: product.trueCostPerUnit,
        targetMargin: sourceProduct?.target_margin ?? 0,
      };
    }),
    saleItems,
    returns,
    expenses: expenses.map((expense) => ({
      product_id: expense.product_id,
      amount: Number(expense.amount),
      expense_date: expense.expense_date,
    })),
  });

  const productAnalysis: MarginProductAnalysis[] = products.map((product) => {
    const productSaleItems = currentSaleItems.filter(
      (item) => item.product_id === product.id,
    );

    const productReturns = currentReturns.filter(
      (item) => item.product_id === product.id,
    );

    const revenue =
      productSaleItems.reduce(
        (total, item) =>
          total +
          Number(item.quantity) * Number(item.unit_price) -
          Number(item.discount),
        0,
      ) -
      productReturns.reduce(
        (total, item) => total + Number(item.refund_amount),
        0,
      );

    const unitsSold =
      productSaleItems.reduce(
        (total, item) => total + Number(item.quantity),
        0,
      ) -
      productReturns.reduce((total, item) => total + Number(item.quantity), 0);

    const trueCostPerUnit =
      trueCosts.find((item) => item.id === product.id)?.trueCostPerUnit ?? 0;

    const acquisitionCost = unitsSold * trueCostPerUnit;

    const directExpenses = currentExpenses
      .filter((expense) => expense.product_id === product.id)
      .reduce((total, expense) => total + Number(expense.amount), 0);

    const returnCosts = productReturns.reduce(
      (total, item) =>
        total +
        Number(item.return_shipping_cost) +
        Number(item.restocking_cost),
      0,
    );

    const contribution =
      revenue - acquisitionCost - directExpenses - returnCosts;

    const margin = calculateContributionMargin(contribution, revenue);

    const targetMargin = Number(product.target_margin ?? 0);

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      revenue,
      contribution,
      margin,
      targetMargin,
      marginGap: margin - targetMargin,
      unitsSold,
    };
  });

  productAnalysis.sort((a, b) => a.marginGap - b.marginGap);

  return {
    range,
    revenue: current.revenue,
    contribution: current.contribution,
    margin: current.margin,
    targetMargin: trend.targetMargin,
    marginGap: current.margin - trend.targetMargin,
    previousMargin: previous.margin,
    marginChange: current.margin - previous.margin,
    trend,
    products: productAnalysis,
  };
}
