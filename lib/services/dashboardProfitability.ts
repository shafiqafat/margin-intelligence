import { getProducts } from "@/lib/services/products";
import { getPurchaseItems } from "@/lib/services/purchases";
import { getSaleItems } from "@/lib/services/sales";
import { getReturns } from "@/lib/services/returns";
import { getExpenses } from "@/lib/services/expenses";
import { getCostAllocations } from "@/lib/services/allocations";

import { calculateProductProfitability } from "@/domain/cost/calculateProductProfitability";
import type { DashboardRange } from "@/types/dashboard";
import { getDateRange } from "@/lib/utils/dateRange";

export async function getDashboardProfitability(
  businessId: string,
  range: DashboardRange,
  timezone: string,
) {
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

  const filteredSaleItems = saleItems.filter((item) => {
    const sale = Array.isArray(item.sale) ? item.sale[0] : item.sale;

    return (
      sale?.sale_date >= dates.startDate && sale?.sale_date <= dates.endDate
    );
  });

  const filteredReturns = returns.filter(
    (item) =>
      item.return_date >= dates.startDate && item.return_date <= dates.endDate,
  );

  const filteredExpenses = expenses.filter(
    (item) =>
      item.expense_date >= dates.startDate &&
      item.expense_date <= dates.endDate,
  );

  const profitabilityResults = products.map((product) =>
    calculateProductProfitability({
      product,
      purchaseItems,
      saleItems: filteredSaleItems,
      returns: filteredReturns,
      expenses: filteredExpenses,
      allocations,
    }),
  );

  return profitabilityResults.filter((result) => result !== null);
}
