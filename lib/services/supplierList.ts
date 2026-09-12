import { getSuppliers } from "@/lib/services/suppliers";
import { getSupplierProducts } from "@/lib/services/suppliers";
import { getPurchases } from "@/lib/services/purchases";

export async function getSupplierListData(businessId: string) {
  const [suppliers, purchases] = await Promise.all([
    getSuppliers(businessId),
    getPurchases(businessId),
  ]);

  const supplierProducts = await Promise.all(
    suppliers.map(async (supplier) => {
      const products = await getSupplierProducts(businessId, supplier.id);

      return {
        supplierId: supplier.id,
        productCount: products.length,
      };
    }),
  );

  return suppliers.map((supplier) => {
    const supplierPurchases = purchases.filter(
      (purchase) => purchase.supplier_id === supplier.id,
    );

    const productData = supplierProducts.find(
      (item) => item.supplierId === supplier.id,
    );

    const totalSpend = supplierPurchases.reduce(
      (total, purchase) => total + purchase.total_cost,
      0,
    );

    return {
      ...supplier,
      productCount: productData?.productCount ?? 0,
      purchaseCount: supplierPurchases.length,
      totalSpend,
    };
  });
}
