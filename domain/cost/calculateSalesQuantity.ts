type SaleItem = {
  product_id: string;
  quantity: number;
};

type ReturnItem = {
  product_id: string;
  quantity: number;
};

export function calculateNetUnitsSold(
  productId: string,
  saleItems: SaleItem[],
  returns: ReturnItem[],
) {
  const soldQuantity = saleItems
    .filter((item) => item.product_id === productId)
    .reduce((total, item) => total + item.quantity, 0);

  const returnedQuantity = returns
    .filter((item) => item.product_id === productId)
    .reduce((total, item) => total + item.quantity, 0);

  return Math.max(0, soldQuantity - returnedQuantity);
}
