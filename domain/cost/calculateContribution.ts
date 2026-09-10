type ContributionInput = {
  netRevenue: number;
  trueUnitCost: number;
  netUnitsSold: number;
  directExpenses: number;
  returnCosts: number;
};

export function calculateContribution({
  netRevenue,
  trueUnitCost,
  netUnitsSold,
  directExpenses,
  returnCosts,
}: ContributionInput) {
  const costOfUnitsSold = trueUnitCost * netUnitsSold;

  const totalProductCost = costOfUnitsSold + directExpenses + returnCosts;

  return netRevenue - totalProductCost;
}
