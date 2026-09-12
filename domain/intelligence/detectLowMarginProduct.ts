type ProductMargin = {
  productId: string;
  productName: string;
  netRevenue: number;
  contribution: number;
  contributionMargin: number;
  targetMargin: number;
};

export type LowMarginFinding = {
  type: "low_margin_product";
  severity: "warning" | "risk";
  productId: string;
  title: string;
  description: string;
  financialImpact: number;
  marginGap: number;
};

const MINIMUM_MARGIN_GAP = 5;

export function detectLowMarginProduct(
  product: ProductMargin,
): LowMarginFinding | null {
  if (product.netRevenue <= 0) {
    return null;
  }

  const marginGap = product.targetMargin - product.contributionMargin;

  if (marginGap < MINIMUM_MARGIN_GAP) {
    return null;
  }

  const severity = marginGap >= 15 ? "risk" : "warning";

  return {
    type: "low_margin_product",
    severity,
    productId: product.productId,
    title: `${product.productName} is below its target margin`,
    description: `Actual contribution margin is ${product.contributionMargin.toFixed(
      1,
    )}%, which is ${marginGap.toFixed(
      1,
    )} percentage points below the ${product.targetMargin.toFixed(1)}% target.`,
    financialImpact: -(product.netRevenue * (marginGap / 100)),
    marginGap,
  };
}
