type SaleContext = {
  id: string;
  delivery_cost: number;
  payment_fee: number;
};

type SaleItem = {
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  sale?: SaleContext | SaleContext[] | null;
};

function getSaleContext(sale: SaleItem["sale"]): SaleContext | null {
  if (!sale) {
    return null;
  }

  return Array.isArray(sale) ? (sale[0] ?? null) : sale;
}

export function calculateProductSellingCosts(
  productId: string,
  saleItems: SaleItem[],
) {
  const productSaleItems = saleItems.filter(
    (item) => item.product_id === productId,
  );

  let sellingCosts = 0;

  for (const productItem of productSaleItems) {
    const sale = getSaleContext(productItem.sale);

    if (!sale) {
      continue;
    }

    const saleItemsForSale = saleItems.filter(
      (item) => item.sale_id === sale.id,
    );

    const saleProductRevenue = saleItemsForSale.reduce(
      (total, item) => total + Number(item.total_price),
      0,
    );

    if (saleProductRevenue <= 0) {
      continue;
    }

    const productShare = Number(productItem.total_price) / saleProductRevenue;

    const saleSellingCosts =
      Number(sale.delivery_cost ?? 0) + Number(sale.payment_fee ?? 0);

    sellingCosts += saleSellingCosts * productShare;
  }

  return sellingCosts;
}
