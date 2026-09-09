type Expense = {
  amount: number;
  product_id: string | null;
};

type CostAllocation = {
  amount: number;
  product_id: string;
};

export function calculateProductDirectCosts(
  productId: string,
  expenses: Expense[],
  allocations: CostAllocation[],
) {
  const productExpenses = expenses
    .filter((expense) => expense.product_id === productId)
    .reduce((total, expense) => total + expense.amount, 0);

  const allocatedCosts = allocations
    .filter((allocation) => allocation.product_id === productId)
    .reduce((total, allocation) => total + allocation.amount, 0);

  return productExpenses + allocatedCosts;
}
