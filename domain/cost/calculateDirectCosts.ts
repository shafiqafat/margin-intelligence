type Expense = {
  amount: number;
  product_id: string | null;
};

export function calculateProductDirectCosts(
  productId: string,
  expenses: Expense[],
) {
  return expenses
    .filter((expense) => expense.product_id === productId)
    .reduce((total, expense) => total + expense.amount, 0);
}
