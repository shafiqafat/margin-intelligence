import { getPurchases } from "@/lib/services/purchases";
import { getPurchaseItems } from "@/lib/services/purchases";

export async function getSupplierAnalytics(
  businessId: string,
  supplierId: string,
) {
  const [purchases, purchaseItems] = await Promise.all([
    getPurchases(businessId),
    getPurchaseItems(businessId),
  ]);

  const supplierPurchases = purchases.filter(
    (purchase) => purchase.supplier_id === supplierId,
  );

  const supplierPurchaseItems = purchaseItems.filter((item) => {
    const purchase = Array.isArray(item.purchase)
      ? item.purchase[0]
      : item.purchase;

    return purchase?.supplier_id === supplierId;
  });

  const totalSpend = supplierPurchases.reduce(
    (total, purchase) => total + purchase.total_cost,
    0,
  );

  const totalUnitsPurchased = supplierPurchaseItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return {
    purchaseCount: supplierPurchases.length,
    totalSpend,
    totalUnitsPurchased,
    purchases: supplierPurchases,
    purchaseItems: supplierPurchaseItems,
  };
}
