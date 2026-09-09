import { calculateWeightedAverageUnitCost } from "./calculateUnitCost";
import { calculateProductDirectCosts } from "./calculateDirectCosts";
import { calculateNetUnitsSold } from "./calculateSalesQuantity";
import { calculateReturnImpact } from "./calculateReturns";
import { calculateProductNetRevenue } from "./calculateRevenue";
import { calculateContribution } from "./calculateContribution";
import { calculateContributionMargin } from "./calculateMargin";
import { calculateTrueUnitCost } from "./calculateTrueCost";

type Product = {
  id: string;
  name: string;
};

type PurchaseItem = {
  product_id: string;
  quantity: number;
  unit_cost: number;
};

type SaleItem = {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
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

  const weightedAverageUnitCost =
    calculateWeightedAverageUnitCost(productPurchaseItems);

  const directCosts = calculateProductDirectCosts(
    product.id,
    expenses,
    allocations,
  );

  const netUnitsSold = calculateNetUnitsSold(product.id, saleItems, returns);

  const netRevenue = calculateProductNetRevenue(product.id, saleItems, returns);

  const productReturns = returns.filter(
    (returnRecord) => returnRecord.product_id === product.id,
  );

  const returnCosts = productReturns.reduce((total, returnRecord) => {
    const impact = calculateReturnImpact(returnRecord);

    return total + impact.returnCosts;
  }, 0);

  const trueUnitCost = calculateTrueUnitCost({
    weightedAverageUnitCost,
    directCosts,
    netUnitsSold,
  });

  const contribution = calculateContribution({
    netRevenue,
    weightedAverageUnitCost,
    netUnitsSold,
    directCosts,
    returnCosts,
  });

  const contributionMargin = calculateContributionMargin(
    contribution,
    netRevenue,
  );

  return {
    productId: product.id,
    productName: product.name,

    netUnitsSold,

    weightedAverageUnitCost,

    directCosts,
    returnCosts,

    trueUnitCost,

    netRevenue,
    contribution,
    contributionMargin,
  };
}
