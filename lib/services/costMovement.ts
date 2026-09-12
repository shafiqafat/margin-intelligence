import { getPurchases } from "@/lib/services/purchases";
import { getSaleItems } from "@/lib/services/sales";
import { getReturns } from "@/lib/services/returns";
import { getExpenses } from "@/lib/services/expenses";
import type { DashboardRange } from "@/types/dashboard";
import { getDateRange } from "@/lib/utils/dateRange";

import {
  calculateCostMovement,
  type CostMovementCategory,
} from "@/domain/cost/calculateCostMovement";

type CostTotals = Record<CostMovementCategory, number>;

function createEmptyTotals(): CostTotals {
  return {
    purchase_costs: 0,
    delivery: 0,
    returns: 0,
    payment_fees: 0,
    packaging: 0,
  };
}

function isDateInRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

export async function getCostMovement(
  businessId: string,
  range: DashboardRange,
  timezone: string,
) {
  const [purchases, saleItems, returns, expenses] = await Promise.all([
    getPurchases(businessId),
    getSaleItems(businessId),
    getReturns(businessId),
    getExpenses(businessId),
  ]);

  const dateRange = getDateRange(range, timezone);

  const currentRange = {
    start: dateRange.startDate,
    end: dateRange.endDate,
  };

  const previousRange = {
    start: dateRange.previousStartDate,
    end: dateRange.previousEndDate,
  };

  const current = createEmptyTotals();
  const previous = createEmptyTotals();

  for (const purchase of purchases) {
    const target = isDateInRange(
      purchase.purchase_date,
      currentRange.start,
      currentRange.end,
    )
      ? current
      : isDateInRange(
            purchase.purchase_date,
            previousRange.start,
            previousRange.end,
          )
        ? previous
        : null;

    if (!target) {
      continue;
    }

    target.purchase_costs += Number(purchase.subtotal);
  }

  for (const saleItem of saleItems) {
    const sale = Array.isArray(saleItem.sale)
      ? saleItem.sale[0]
      : saleItem.sale;

    if (!sale) {
      continue;
    }

    const target = isDateInRange(
      sale.sale_date,
      currentRange.start,
      currentRange.end,
    )
      ? current
      : isDateInRange(sale.sale_date, previousRange.start, previousRange.end)
        ? previous
        : null;

    if (!target) {
      continue;
    }

    target.delivery += Number(sale.delivery_cost ?? 0);

    target.payment_fees += Number(sale.payment_fee ?? 0);
  }

  for (const returnRecord of returns) {
    const target = isDateInRange(
      returnRecord.return_date,
      currentRange.start,
      currentRange.end,
    )
      ? current
      : isDateInRange(
            returnRecord.return_date,
            previousRange.start,
            previousRange.end,
          )
        ? previous
        : null;

    if (!target) {
      continue;
    }

    target.returns +=
      Number(returnRecord.return_shipping_cost ?? 0) +
      Number(returnRecord.restocking_cost ?? 0);
  }

  for (const expense of expenses) {
    const target = isDateInRange(
      expense.expense_date,
      currentRange.start,
      currentRange.end,
    )
      ? current
      : isDateInRange(
            expense.expense_date,
            previousRange.start,
            previousRange.end,
          )
        ? previous
        : null;

    if (!target) {
      continue;
    }

    const categoryName = expense.category?.name?.trim().toLowerCase();

    if (categoryName === "packaging") {
      target.packaging += Number(expense.amount);
    }
  }

  return {
    movements: calculateCostMovement({
      current,
      previous,
    }),
    currentRange,
    previousRange,
  };
}
