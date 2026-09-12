import { getPurchases, getPurchaseItems } from "@/lib/services/purchases";

export async function getPurchaseListData(businessId: string) {
  const [purchases, purchaseItems] = await Promise.all([
    getPurchases(businessId),
    getPurchaseItems(businessId),
  ]);

  return purchases.map((purchase) => {
    const items = purchaseItems.filter(
      (item) => item.purchase?.id === purchase.id,
    );

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    const extraCosts = purchase.shipping_cost + purchase.additional_cost;

    return {
      ...purchase,
      itemCount,
      extraCosts,
    };
  });
}
