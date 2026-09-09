import Link from "next/link";
import { getCurrentBusiness } from "@/lib/services/business";
import { getProducts } from "@/lib/services/products";

export default async function ProductsPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const products = await getProducts(business.id);

  return (
    <main className="space-y-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your products and understand their profitability.
          </p>
        </div>

        <Link
          href="/products/new"
          className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Add Product
        </Link>
      </div>

      <div className="rounded-xl border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Product</th>

                <th className="px-4 py-3 text-left font-medium">SKU</th>

                <th className="px-4 py-3 text-left font-medium">Category</th>

                <th className="px-4 py-3 text-right font-medium">
                  Selling Price
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Target Margin
                </th>

                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="transition hover:bg-muted/30">
                  <td className="px-4 py-4 font-medium">
                    <Link
                      href={`/products/${product.id}`}
                      className="transition hover:text-blue-600"
                    >
                      {product.name}
                    </Link>
                  </td>

                  <td className="px-4 py-4 text-muted-foreground">
                    {product.sku || "—"}
                  </td>

                  <td className="px-4 py-4 text-muted-foreground">
                    {product.category || "—"}
                  </td>

                  <td className="px-4 py-4 text-right">
                    {product.selling_price.toLocaleString()} {business.currency}
                  </td>

                  <td className="px-4 py-4 text-right">
                    {product.target_margin}%
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={
                        product.status === "active"
                          ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
