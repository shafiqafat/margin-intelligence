type ProductReturnData = {
  productId: string;
  productName: string;
  unitsSold: number;
  unitsReturned: number;
};

export type ReturnAnomalyFinding = {
  type: "return_anomaly";
  severity: "warning" | "risk";
  productId: string;
  title: string;
  description: string;
  financialImpact: number;
  returnRate: number;
  businessReturnRate: number;
};

const MINIMUM_UNITS_SOLD = 5;
const MINIMUM_BUSINESS_RETURNS = 2;
const MINIMUM_RATE_GAP = 5;
const MINIMUM_MULTIPLE = 2;

export function detectReturnAnomaly(
  product: ProductReturnData,
  businessUnitsSold: number,
  businessUnitsReturned: number,
): ReturnAnomalyFinding | null {
  if (product.unitsSold < MINIMUM_UNITS_SOLD) {
    return null;
  }

  if (businessUnitsReturned < MINIMUM_BUSINESS_RETURNS) {
    return null;
  }

  if (businessUnitsSold <= 0) {
    return null;
  }

  const returnRate = (product.unitsReturned / product.unitsSold) * 100;

  const businessReturnRate = (businessUnitsReturned / businessUnitsSold) * 100;

  const rateGap = returnRate - businessReturnRate;

  if (
    rateGap < MINIMUM_RATE_GAP ||
    returnRate < businessReturnRate * MINIMUM_MULTIPLE
  ) {
    return null;
  }

  const severity = returnRate >= businessReturnRate * 3 ? "risk" : "warning";

  return {
    type: "return_anomaly",
    severity,
    productId: product.productId,
    title: `${product.productName} has an unusually high return rate`,
    description: `Return rate is ${returnRate.toFixed(
      1,
    )}%, compared with a business average of ${businessReturnRate.toFixed(
      1,
    )}%.`,
    financialImpact: 0,
    returnRate,
    businessReturnRate,
  };
}
