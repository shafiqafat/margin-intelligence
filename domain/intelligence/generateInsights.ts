import { detectLowMarginProduct } from "./detectLowMarginProduct";
import { detectCostIncrease } from "./detectCostIncrease";
import { detectReturnAnomaly } from "./detectReturnAnomaly";
import { detectSupplierOpportunity } from "./detectSupplierOpportunity";
import type { InsightFinding } from "@/types/intelligence";
import { detectSupplierIssue } from "./detectSupplierIssue";
import { generateInsightExplanation } from "./generateInsightExplanation";

type ProductMargin = {
  productId: string;
  productName: string;
  netRevenue: number;
  contribution: number;
  contributionMargin: number;
  targetMargin: number;
};

type PurchaseRecord = {
  productId: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  quantity: number;
  unitCost: number;
};

type SaleRecord = {
  productId: string;
  quantity: number;
};

type ReturnRecord = {
  productId: string;
  quantity: number;
};

export type IntelligenceContext = {
  products: ProductMargin[];
  purchaseRecords: PurchaseRecord[];
  saleRecords: SaleRecord[];
  returnRecords: ReturnRecord[];
};


type IntelligenceRule = (
  product: ProductMargin,
  context: IntelligenceContext,
) => InsightFinding | null;

/**
 * Low margin rule
 */
const lowMarginRule: IntelligenceRule = (product) => {
  return detectLowMarginProduct(product);
};

/**
 * Cost increase rule
 */
const costIncreaseRule: IntelligenceRule = (product, context) => {
  const productPurchases = context.purchaseRecords
    .filter((purchase) => purchase.productId === product.productId)
    .map((purchase) => ({
      purchaseDate: purchase.purchaseDate,
      quantity: purchase.quantity,
      unitCost: purchase.unitCost,
    }));

  return detectCostIncrease(
    product.productId,
    product.productName,
    productPurchases,
  );
};

/**
 * Return anomaly rule
 */
const returnAnomalyRule: IntelligenceRule = (product, context) => {
  const businessUnitsSold = context.saleRecords.reduce(
    (total, sale) => total + sale.quantity,
    0,
  );

  const businessUnitsReturned = context.returnRecords.reduce(
    (total, returnRecord) => total + returnRecord.quantity,
    0,
  );

  const productUnitsSold = context.saleRecords
    .filter((sale) => sale.productId === product.productId)
    .reduce((total, sale) => total + sale.quantity, 0);

  const productUnitsReturned = context.returnRecords
    .filter((returnRecord) => returnRecord.productId === product.productId)
    .reduce((total, returnRecord) => total + returnRecord.quantity, 0);

  return detectReturnAnomaly(
    {
      productId: product.productId,

      productName: product.productName,

      unitsSold: productUnitsSold,

      unitsReturned: productUnitsReturned,
    },
    businessUnitsSold,
    businessUnitsReturned,
  );
};

/**
 * Supplier opportunity rule
 */
const supplierOpportunityRule: IntelligenceRule = (product, context) => {
  const productSupplierPurchases = context.purchaseRecords
    .filter((purchase) => purchase.productId === product.productId)
    .map((purchase) => ({
      supplierId: purchase.supplierId,

      supplierName: purchase.supplierName,

      quantity: purchase.quantity,

      unitCost: purchase.unitCost,
    }));

  return detectSupplierOpportunity(
    product.productId,
    product.productName,
    productSupplierPurchases,
  );
};

const supplierIssueRule: IntelligenceRule = (product, context) => {
  const productSupplierPurchases = context.purchaseRecords
    .filter((purchase) => purchase.productId === product.productId)
    .map((purchase) => ({
      supplierId: purchase.supplierId,

      supplierName: purchase.supplierName,

      purchaseDate: purchase.purchaseDate,

      quantity: purchase.quantity,

      unitCost: purchase.unitCost,
    }));

  return detectSupplierIssue(
    product.productId,
    product.productName,
    productSupplierPurchases,
  );
};

const intelligenceRules: IntelligenceRule[] = [
  lowMarginRule,
  costIncreaseRule,
  returnAnomalyRule,
  supplierOpportunityRule,
  supplierIssueRule,
];
/**
 * All intelligence rules.
 *
 * Add new rules here instead of
 * modifying generateInsights().
 */

export function generateInsights(
  products: ProductMargin[],
  purchaseRecords: PurchaseRecord[] = [],
  saleRecords: SaleRecord[] = [],
  returnRecords: ReturnRecord[] = [],
) {
  const context: IntelligenceContext = {
    products,
    purchaseRecords,
    saleRecords,
    returnRecords,
  };

  const findings = products.flatMap((product) => {
    return intelligenceRules
      .map((rule) => rule(product, context))
      .filter((finding): finding is InsightFinding => finding !== null);
  });

  return findings.map((finding) => ({
    ...finding,
    explanation: generateInsightExplanation(finding, findings),
  }));
}
