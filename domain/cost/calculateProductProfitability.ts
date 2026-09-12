import { calculateWeightedAverageUnitCost } from "./calculateUnitCost";
import { calculateNetUnitsSold } from "./calculateSalesQuantity";
import { calculateReturnImpact } from "./calculateReturns";
import { calculateProductNetRevenue } from "./calculateRevenue";
import { calculateContribution } from "./calculateContribution";
import { calculateContributionMargin } from "./calculateMargin";
import { calculateTrueUnitCost } from "./calculateTrueCost";
import { calculateProductSellingCosts } from "./calculateProductSellingCosts";

type Product = {
  id: string;
  name: string;
  target_margin: number;
};

type PurchaseItem = {
  product_id: string;
  quantity: number;
  unit_cost: number;
};

type SaleContext = {
  id: string;
  delivery_cost: number;
  payment_fee: number;
};

type SaleItem = {
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  sale?: SaleContext | SaleContext[] | null;
};

type ReturnRecord = {
  product_id: string;
  quantity: number;
  refund_amount: number;
  return_shipping_cost: number;
  restocking_cost: number;
};

type Expense = {
  amount: number;
  product_id: string | null;
};

type CostAllocation = {
  amount: number;
  product_id: string;
};

type ProductProfitabilityInput = {
  product: Product;
  purchaseItems: PurchaseItem[];
  saleItems: SaleItem[];
  returns: ReturnRecord[];
  expenses: Expense[];
  allocations: CostAllocation[];
};

export function calculateProductProfitability({
  product,
  purchaseItems,
  saleItems,
  returns,
  expenses,
  allocations,
}: ProductProfitabilityInput) {
  const productPurchaseItems = purchaseItems.filter(
    (item) => item.product_id === product.id,
  );

  const purchaseCost = productPurchaseItems.reduce(
    (total, item) => total + item.quantity * item.unit_cost,
    0,
  );

  const weightedAverageUnitCost =
    calculateWeightedAverageUnitCost(productPurchaseItems);

  const productDirectExpenses = expenses
    .filter((expense) => expense.product_id === product.id)
    .reduce((total, expense) => total + expense.amount, 0);

  const netUnitsSold = calculateNetUnitsSold(product.id, saleItems, returns);

  const netRevenue = calculateProductNetRevenue(product.id, saleItems, returns);

  const productReturns = returns.filter(
    (returnRecord) => returnRecord.product_id === product.id,
  );

  const returnCosts = productReturns.reduce((total, returnRecord) => {
    const impact = calculateReturnImpact(returnRecord);

    return total + impact.returnCosts;
  }, 0);

  const trueUnitCost = calculateTrueUnitCost(
    product.id,
    purchaseItems,
    allocations,
  );

  const allocatedDirectCosts = allocations
    .filter((allocation) => allocation.product_id === product.id)
    .reduce((total, allocation) => total + allocation.amount, 0);

  const sellingCosts = calculateProductSellingCosts(product.id, saleItems);

  const contribution = calculateContribution({
    netRevenue,
    weightedAverageUnitCost,
    netUnitsSold,
    directCosts: productDirectExpenses,
    returnCosts,
    sellingCosts,
  });

  const contributionMargin = calculateContributionMargin(
    contribution,
    netRevenue,
  );

  const targetMargin = product.target_margin;

  const marginGap = targetMargin - contributionMargin;

  return {
    productId: product.id,
    productName: product.name,

    netUnitsSold,

    weightedAverageUnitCost,

    allocatedDirectCosts,
    directExpenses: productDirectExpenses,
    returnCosts,
    sellingCosts,

    purchaseCost,
    trueUnitCost,

    targetMargin,
    marginGap,

    netRevenue,
    contribution,
    contributionMargin,
  };
}
