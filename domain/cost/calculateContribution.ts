type ContributionInput = {
  netRevenue: number;
  weightedAverageUnitCost: number;
  netUnitsSold: number;
  directCosts: number;
  returnCosts: number;
};

export function calculateContribution({
  netRevenue,
  weightedAverageUnitCost,
  netUnitsSold,
  directCosts,
  returnCosts,
}: ContributionInput) {
  const acquisitionCost = weightedAverageUnitCost * netUnitsSold;

  const totalProductCost = acquisitionCost + directCosts + returnCosts;

  return netRevenue - totalProductCost;
}
