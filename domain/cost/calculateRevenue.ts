type SaleItem = {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
};

type ReturnRecord = {
  product_id: string;
  refund_amount: number;
};

export function calculateSaleItemRevenue(item: SaleItem) {
  return item.quantity * item.unit_price - item.discount;
}

export function calculateProductNetRevenue(
  productId: string,
  saleItems: SaleItem[],
  returns: ReturnRecord[],
) {
  const grossRevenue = saleItems
    .filter((item) => item.product_id === productId)
    .reduce((total, item) => total + calculateSaleItemRevenue(item), 0);

  const refundedRevenue = returns
    .filter((returnRecord) => returnRecord.product_id === productId)
    .reduce((total, returnRecord) => total + returnRecord.refund_amount, 0);

  return Math.max(0, grossRevenue - refundedRevenue);
}
