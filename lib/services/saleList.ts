import { getSales, getSaleItems } from "@/lib/services/sales";

export async function getSaleListData(businessId: string) {
  const [sales, saleItems] = await Promise.all([
    getSales(businessId),
    getSaleItems(businessId),
  ]);

  return sales.map((sale) => {
    const items = saleItems.filter((item) => item.sale_id === sale.id);

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    return {
      ...sale,
      itemCount,
    };
  });
}
