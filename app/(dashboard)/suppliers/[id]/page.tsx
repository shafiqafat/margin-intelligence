import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getSupplierById, getSupplierProducts } from "@/lib/services/suppliers";

export default async function SupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const supplier = await getSupplierById(business.id, id);

  if (!supplier) {
    return (
      <main className="p-8">
        <Link
          href="/suppliers"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to suppliers
        </Link>

        <h1 className="mt-6 text-2xl font-semibold">Supplier not found</h1>
      </main>
    );
  }

  const supplierProducts = await getSupplierProducts(business.id, supplier.id);

  return (
    <main className="space-y-8 p-8">
      {/* Header */}

      <div>
        <Link
          href="/suppliers"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to suppliers
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{supplier.name}</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Supplier details and product relationships.
            </p>
          </div>

          <Link
            href={`/suppliers/${supplier.id}/edit`}
            className="inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Supplier Information */}

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Supplier Information</h2>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Contact person</p>

            <p className="mt-1 font-medium">{supplier.contact_name || "—"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>

            <p className="mt-1 font-medium">{supplier.email || "—"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Phone</p>

            <p className="mt-1 font-medium">{supplier.phone || "—"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Added</p>

            <p className="mt-1 font-medium">
              {new Date(supplier.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {supplier.notes && (
          <div className="border-t p-5">
            <p className="text-sm text-muted-foreground">Notes</p>

            <p className="mt-1 text-sm leading-6">{supplier.notes}</p>
          </div>
        )}
      </section>

      {/* Products */}

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Products Supplied</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Products currently associated with this supplier.
          </p>
        </div>

        {supplierProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Product</th>

                  <th className="px-5 py-3 text-left font-medium">SKU</th>

                  <th className="px-5 py-3 text-left font-medium">Category</th>

                  <th className="px-5 py-3 text-left font-medium">Status</th>

                  <th className="px-5 py-3 text-left font-medium">
                    Supplier Role
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {supplierProducts.map((relationship) => {
                  const product = relationship.product;

                  return (
                    <tr
                      key={relationship.id}
                      className="transition hover:bg-muted/30"
                    >
                      <td className="px-5 py-4 font-medium">
                        <Link
                          href={`/products/${product.id}`}
                          className="transition hover:text-blue-600"
                        >
                          {product.name}
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {product.sku || "—"}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {product.category || "—"}
                      </td>

                      <td className="px-5 py-4">{product.status}</td>

                      <td className="px-5 py-4">
                        {relationship.is_primary ? "Primary" : "Alternative"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium">No products linked yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Products supplied by this supplier will appear here.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
