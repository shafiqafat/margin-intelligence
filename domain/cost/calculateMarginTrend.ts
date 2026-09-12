export type MarginTrendProduct = {
  productId: string;
  trueUnitCost: number;
  targetMargin: number;
};

export type MarginTrendSale = {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  sale:
    | {
        sale_date: string;
      }
    | Array<{
        sale_date: string;
      }>
    | null;
};

export type MarginTrendReturn = {
  product_id: string;
  refund_amount: number;
  return_shipping_cost: number;
  restocking_cost: number;
  return_date: string;
};

export type MarginTrendExpense = {
  product_id: string | null;
  amount: number;
  expense_date: string;
};

export type MarginTrendWeek = {
  week: string;
  margin: number;
  revenue: number;
  contribution: number;
};

function getSaleDate(sale: MarginTrendSale["sale"]) {
  if (Array.isArray(sale)) {
    return sale[0]?.sale_date ?? null;
  }

  return sale?.sale_date ?? null;
}

function getProductUnitCost(productId: string, products: MarginTrendProduct[]) {
  return (
    products.find((product) => product.productId === productId)?.trueUnitCost ??
    0
  );
}

export function calculateMarginTrend({
  startDate,
  endDate,
  products,
  saleItems,
  returns,
  expenses,
}: {
  startDate: string;
  endDate: string;
  products: MarginTrendProduct[];
  saleItems: MarginTrendSale[];
  returns: MarginTrendReturn[];
  expenses: MarginTrendExpense[];
}) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const totalDays =
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const weekCount = Math.max(1, Math.ceil(totalDays / 7));

  const weeks: MarginTrendWeek[] = [];

  for (let index = 0; index < weekCount; index++) {
    const weekStart = new Date(start);

    weekStart.setDate(weekStart.getDate() + index * 7);

    const weekEnd = new Date(weekStart);

    weekEnd.setDate(weekEnd.getDate() + 6);

    if (weekEnd > end) {
      weekEnd.setTime(end.getTime());
    }

    const weekStartString = weekStart.toISOString().slice(0, 10);

    const weekEndString = weekEnd.toISOString().slice(0, 10);

    const inWeek = (date: string) =>
      date >= weekStartString && date <= weekEndString;

    const weekSales = saleItems.filter((item) => {
      const saleDate = getSaleDate(item.sale);

      return saleDate ? inWeek(saleDate) : false;
    });

    const revenue = weekSales.reduce(
      (total, item) => total + item.quantity * item.unit_price - item.discount,
      0,
    );

    const costOfUnitsSold = weekSales.reduce(
      (total, item) =>
        total + item.quantity * getProductUnitCost(item.product_id, products),
      0,
    );

    const weekReturns = returns.filter((returnRecord) =>
      inWeek(returnRecord.return_date),
    );

    const refundedRevenue = weekReturns.reduce(
      (total, returnRecord) => total + returnRecord.refund_amount,
      0,
    );

    const returnCosts = weekReturns.reduce(
      (total, returnRecord) =>
        total +
        returnRecord.return_shipping_cost +
        returnRecord.restocking_cost,
      0,
    );

    const directExpenses = expenses
      .filter(
        (expense) =>
          expense.product_id !== null && inWeek(expense.expense_date),
      )
      .reduce((total, expense) => total + expense.amount, 0);

    const netRevenue = revenue - refundedRevenue;

    const contribution =
      netRevenue - costOfUnitsSold - directExpenses - returnCosts;

    const margin = netRevenue > 0 ? (contribution / netRevenue) * 100 : 0;

    weeks.push({
      week: `Week ${index + 1}`,
      margin,
      revenue: netRevenue,
      contribution,
    });
  }

  const soldProductRevenue = new Map<string, number>();

  for (const saleItem of saleItems) {
    const saleDate = getSaleDate(saleItem.sale);

    if (!saleDate || !(saleDate >= startDate && saleDate <= endDate)) {
      continue;
    }

    const revenue = saleItem.quantity * saleItem.unit_price - saleItem.discount;

    soldProductRevenue.set(
      saleItem.product_id,
      (soldProductRevenue.get(saleItem.product_id) ?? 0) + revenue,
    );
  }

  let weightedTargetTotal = 0;
  let weightedRevenueTotal = 0;

  for (const product of products) {
    const revenue = soldProductRevenue.get(product.productId) ?? 0;

    if (revenue <= 0) {
      continue;
    }

    weightedTargetTotal += revenue * product.targetMargin;

    weightedRevenueTotal += revenue;
  }

  const targetMargin =
    weightedRevenueTotal > 0 ? weightedTargetTotal / weightedRevenueTotal : 0;

  return {
    weeks,
    targetMargin,
  };
}
