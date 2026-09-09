type TrueCostInput = {
  weightedAverageUnitCost: number;
  directCosts: number;
  netUnitsSold: number;
};

export function calculateTrueUnitCost({
  weightedAverageUnitCost,
  directCosts,
  netUnitsSold,
}: TrueCostInput) {
  if (netUnitsSold <= 0) {
    return weightedAverageUnitCost;
  }

  const directCostPerUnit = directCosts / netUnitsSold;

  return weightedAverageUnitCost + directCostPerUnit;
}
