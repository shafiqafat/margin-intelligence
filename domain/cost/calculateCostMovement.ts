export type CostMovementCategory =
  | "purchase_costs"
  | "delivery"
  | "returns"
  | "payment_fees"
  | "packaging";

export type CostMovementInput = {
  current: Record<CostMovementCategory, number>;
  previous: Record<CostMovementCategory, number>;
};

export type CostMovementResult = {
  name: string;
  category: CostMovementCategory;
  amount: number;
  description: string;
  percentage: number;
};

const categoryMeta: Record<
  CostMovementCategory,
  {
    name: string;
    description: string;
  }
> = {
  purchase_costs: {
    name: "Purchase costs",
    description: "Changes in product acquisition costs",
  },
  delivery: {
    name: "Delivery",
    description: "Changes in delivery costs",
  },
  returns: {
    name: "Returns",
    description: "Return-related costs",
  },
  payment_fees: {
    name: "Payment fees",
    description: "Changes in payment processing fees",
  },
  packaging: {
    name: "Packaging",
    description: "Changes in packaging expenses",
  },
};

export function calculateCostMovement({
  current,
  previous,
}: CostMovementInput): CostMovementResult[] {
  const categories = Object.keys(categoryMeta) as CostMovementCategory[];

  const movements = categories.map((category) => {
    const amount = current[category] - previous[category];

    return {
      category,
      name: categoryMeta[category].name,
      amount,
      description: categoryMeta[category].description,
      percentage: 0,
    };
  });

  const totalIncrease = movements.reduce(
    (total, movement) => total + Math.max(movement.amount, 0),
    0,
  );

  return movements
    .filter((movement) => movement.amount !== 0)
    .map((movement) => ({
      ...movement,
      percentage:
        totalIncrease > 0 && movement.amount > 0
          ? (movement.amount / totalIncrease) * 100
          : 0,
    }))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
}
