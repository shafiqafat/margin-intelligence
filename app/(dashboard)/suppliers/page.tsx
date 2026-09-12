import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getSupplierListData } from "@/lib/services/supplierList";

export default async function SuppliersPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const suppliers = await getSupplierListData(business.id);

  return (
    <main className="space-y-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Suppliers</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage suppliers and track your sourcing relationships.
          </p>
        </div>

        <Link
          href="/suppliers/new"
          className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Add Supplier
        </Link>
      </div>

      <div className="rounded-xl border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Supplier</th>

                <th className="px-4 py-3 text-right font-medium">Products</th>

                <th className="px-4 py-3 text-right font-medium">Purchases</th>

                <th className="px-4 py-3 text-right font-medium">
                  Total Spend
                </th>

                <th className="px-4 py-3 text-left font-medium">Contact</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="transition hover:bg-muted/30">
                  {/* Supplier */}

                  <td className="px-4 py-4 font-medium">
                    <Link
                      href={`/suppliers/${supplier.id}`}
                      className="transition hover:text-blue-600"
                    >
                      {supplier.name}
                    </Link>

                    {supplier.contact_name && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {supplier.contact_name}
                      </p>
                    )}
                  </td>

                  {/* Products */}

                  <td className="px-4 py-4 text-right">
                    {supplier.productCount}
                  </td>

                  {/* Purchases */}

                  <td className="px-4 py-4 text-right">
                    {supplier.purchaseCount}
                  </td>

                  {/* Total Spend */}

                  <td className="px-4 py-4 text-right font-medium">
                    {supplier.totalSpend.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {business.currency}
                  </td>

                  {/* Contact */}

                  <td className="px-4 py-4 text-muted-foreground">
                    {supplier.email || supplier.phone || "—"}
                  </td>
                </tr>
              ))}

              {suppliers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No suppliers found.
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
