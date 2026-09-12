import { createClient } from "@/lib/supabase/server";
import { getDateRange } from "@/lib/utils/dateRange";
import {
  calculateCostMovement,
  type CostMovementCategory,
} from "@/domain/cost/calculateCostMovement";
import { calculateProductDirectCosts } from "@/domain/cost/calculateDirectCosts";
import { calculateProductTrueCost } from "@/domain/cost/calculateTrueCost";
import type { DashboardRange } from "@/types/dashboard";

type CostSummary = {
  purchaseCosts: number;
  directCosts: number;
  delivery: number;
  paymentFees: number;
  returns: number;
  total: number;
};

type ProductCostAnalysis = {
  productId: string;
  productName: string;
  sku: string | null;
  purchaseCosts: number;
  directCosts: number;
  trueCost: number;
  purchasedQuantity: number;
  trueCostPerUnit: number;
};

export type CostAnalysisData = {
  range: DashboardRange;
  current: CostSummary;
  previous: CostSummary;
  movements: ReturnType<typeof calculateCostMovement>;
  products: ProductCostAnalysis[];
};

export async function getCostAnalysis(
  businessId: string,
  range: DashboardRange,
  timezone: string,
): Promise<CostAnalysisData> {
  const supabase = await createClient();

  const { startDate, endDate, previousStartDate, previousEndDate } =
    getDateRange(range, timezone);

  const [
    productsResult,
    purchaseItemsResult,
    expensesResult,
    salesResult,
    returnsResult,
    allocationsResult,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, sku")
      .eq("business_id", businessId),

    supabase
      .from("purchase_items")
      .select(
        `
        id,
        product_id,
        quantity,
        unit_cost,
        total_cost,
        purchase:purchases!inner(
          id,
          business_id,
          purchase_date
        )
      `,
      )
      .eq("purchase.business_id", businessId),

    supabase
      .from("expenses")
      .select(
        `
        id,
        product_id,
        amount,
        expense_date,
        category:cost_categories(
          id,
          name,
          type
        )
      `,
      )
      .eq("business_id", businessId),

    supabase
      .from("sales")
      .select(
        `
        id,
        sale_date,
        delivery_cost,
        payment_fee
      `,
      )
      .eq("business_id", businessId),

    supabase
      .from("returns")
      .select(
        `
        id,
        product_id,
        quantity,
        refund_amount,
        return_shipping_cost,
        restocking_cost,
        return_date
      `,
      )
      .eq("business_id", businessId),

    supabase
      .from("cost_allocations")
      .select(
        `
        id,
        source_type,
        source_id,
        product_id,
        amount,
        allocation_method,
        created_at
      `,
      )
      .eq("business_id", businessId),
  ]);

  if (productsResult.error) {
    throw new Error(productsResult.error.message);
  }

  if (purchaseItemsResult.error) {
    throw new Error(purchaseItemsResult.error.message);
  }

  if (expensesResult.error) {
    throw new Error(expensesResult.error.message);
  }

  if (salesResult.error) {
    throw new Error(salesResult.error.message);
  }

  if (returnsResult.error) {
    throw new Error(returnsResult.error.message);
  }

  if (allocationsResult.error) {
    throw new Error(allocationsResult.error.message);
  }

  const products = productsResult.data ?? [];
  const purchaseItems = purchaseItemsResult.data ?? [];
  const expenses = expensesResult.data ?? [];
  const sales = salesResult.data ?? [];
  const returns = returnsResult.data ?? [];
  const allocations = allocationsResult.data ?? [];

  const isCurrent = (date: string) => date >= startDate && date <= endDate;

  const isPrevious = (date: string) =>
    date >= previousStartDate && date <= previousEndDate;

  const currentPurchaseItems = purchaseItems.filter((item) => {
    const purchase = Array.isArray(item.purchase)
      ? item.purchase[0]
      : item.purchase;

    return purchase?.purchase_date ? isCurrent(purchase.purchase_date) : false;
  });

  const previousPurchaseItems = purchaseItems.filter((item) => {
    const purchase = Array.isArray(item.purchase)
      ? item.purchase[0]
      : item.purchase;

    return purchase?.purchase_date ? isPrevious(purchase.purchase_date) : false;
  });

  const currentExpenses = expenses.filter((expense) =>
    isCurrent(expense.expense_date),
  );

  const previousExpenses = expenses.filter((expense) =>
    isPrevious(expense.expense_date),
  );

  const currentSales = sales.filter((sale) => isCurrent(sale.sale_date));

  const previousSales = sales.filter((sale) => isPrevious(sale.sale_date));

  const currentReturns = returns.filter((item) => isCurrent(item.return_date));

  const previousReturns = returns.filter((item) =>
    isPrevious(item.return_date),
  );

  function calculateSummary(
    periodPurchaseItems: typeof purchaseItems,
    periodExpenses: typeof expenses,
    periodSales: typeof sales,
    periodReturns: typeof returns,
  ): CostSummary {
    const purchaseCosts = periodPurchaseItems.reduce(
      (total, item) => total + Number(item.total_cost),
      0,
    );

    const directCosts = periodExpenses
      .filter((expense) => {
        const category = Array.isArray(expense.category)
          ? expense.category[0]
          : expense.category;

        return category?.type === "direct";
      })
      .reduce((total, expense) => total + Number(expense.amount), 0);

    const delivery = periodSales.reduce(
      (total, sale) => total + Number(sale.delivery_cost ?? 0),
      0,
    );

    const paymentFees = periodSales.reduce(
      (total, sale) => total + Number(sale.payment_fee ?? 0),
      0,
    );

    const returnsCost = periodReturns.reduce(
      (total, item) =>
        total +
        Number(item.return_shipping_cost ?? 0) +
        Number(item.restocking_cost ?? 0),
      0,
    );

    const total =
      purchaseCosts + directCosts + delivery + paymentFees + returnsCost;

    return {
      purchaseCosts,
      directCosts,
      delivery,
      paymentFees,
      returns: returnsCost,
      total,
    };
  }

  const current = calculateSummary(
    currentPurchaseItems,
    currentExpenses,
    currentSales,
    currentReturns,
  );

  const previous = calculateSummary(
    previousPurchaseItems,
    previousExpenses,
    previousSales,
    previousReturns,
  );

  const movementInput = {
    current: {
      purchase_costs: current.purchaseCosts,
      delivery: current.delivery,
      returns: current.returns,
      payment_fees: current.paymentFees,
      packaging: 0,
    } satisfies Record<CostMovementCategory, number>,

    previous: {
      purchase_costs: previous.purchaseCosts,
      delivery: previous.delivery,
      returns: previous.returns,
      payment_fees: previous.paymentFees,
      packaging: 0,
    } satisfies Record<CostMovementCategory, number>,
  };

  const movements = calculateCostMovement(movementInput);

  const productsAnalysis: ProductCostAnalysis[] = products.map((product) => {
    const trueCost = calculateProductTrueCost(
      product.id,
      purchaseItems,
      allocations,
    );

    const directCosts = calculateProductDirectCosts(
      product.id,
      expenses.map((expense) => ({
        amount: Number(expense.amount),
        product_id: expense.product_id,
      })),
    );

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      purchaseCosts: trueCost.purchaseCost,
      directCosts,
      trueCost: trueCost.totalTrueCost,
      purchasedQuantity: trueCost.purchasedQuantity,
      trueCostPerUnit: trueCost.trueCostPerUnit,
    };
  });

  productsAnalysis.sort((a, b) => b.trueCost - a.trueCost);

  return {
    range,
    current,
    previous,
    movements,
    products: productsAnalysis,
  };
}
