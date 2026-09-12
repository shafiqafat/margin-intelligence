import { getPurchaseItems } from "@/lib/services/purchases";
import { getProducts } from "@/lib/services/products";

export async function getSupplierCostSignals(
  businessId: string,
  supplierId: string,
) {
  const [purchaseItems, products] = await Promise.all([
    getPurchaseItems(businessId),
    getProducts(businessId),
  ]);

  const supplierItems = purchaseItems.filter((item) => {
    const purchase = Array.isArray(item.purchase)
      ? item.purchase[0]
      : item.purchase;

    return purchase?.supplier_id === supplierId;
  });

  const signals = products
    .map((product) => {
      const productItems = supplierItems
        .filter((item) => item.product_id === product.id)
        .map((item) => {
          const purchase = Array.isArray(item.purchase)
            ? item.purchase[0]
            : item.purchase;

          return {
            unitCost: item.unit_cost,
            quantity: item.quantity,
            purchaseDate: purchase?.purchase_date ?? null,
            purchaseId: purchase?.id ?? null,
          };
        })
        .filter((item) => item.purchaseDate !== null)
        .sort(
          (a, b) =>
            new Date(b.purchaseDate!).getTime() -
            new Date(a.purchaseDate!).getTime(),
        );

      if (productItems.length < 2) {
        return null;
      }

      const latest = productItems[0];
      const previous = productItems[1];

      const change =
        previous.unitCost > 0
          ? ((latest.unitCost - previous.unitCost) / previous.unitCost) * 100
          : 0;

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        previousUnitCost: previous.unitCost,
        latestUnitCost: latest.unitCost,
        changePercentage: change,
        latestPurchaseDate: latest.purchaseDate,
      };
    })
    .filter((signal) => signal !== null);

  return signals;
}
