type ContributionInput = {
  netRevenue: number;
  weightedAverageUnitCost: number;
  netUnitsSold: number;
  directCosts: number;
  returnCosts: number;
  sellingCosts?: number;
};

export function calculateContribution({
  netRevenue,
  weightedAverageUnitCost,
  netUnitsSold,
  directCosts,
  returnCosts,
  sellingCosts = 0,
}: ContributionInput) {
  const acquisitionCost = weightedAverageUnitCost * netUnitsSold;

  const totalProductCost =
    acquisitionCost + directCosts + returnCosts + sellingCosts;

  return netRevenue - totalProductCost;
}
