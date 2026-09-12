import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getSupplierById, getSupplierProducts } from "@/lib/services/suppliers";
import { getSupplierAnalytics } from "@/lib/services/supplierAnalytics";
import { getSupplierCostSignals } from "@/lib/services/supplierCostSignals";
import { getSupplierCostImpact } from "@/lib/services/supplierCostImpact";

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

  const [supplierProducts, analytics, costSignals, costImpact] =
    await Promise.all([
      getSupplierProducts(business.id, supplier.id),
      getSupplierAnalytics(business.id, supplier.id),
      getSupplierCostSignals(business.id, supplier.id),
      getSupplierCostImpact(business.id, supplier.id),
    ]);

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

      {/* Supplier Overview */}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Products supplied</p>

          <p className="mt-2 text-2xl font-semibold">
            {supplierProducts.length}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Purchase records</p>

          <p className="mt-2 text-2xl font-semibold">
            {analytics.purchaseCount}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Total spend</p>

          <p className="mt-2 text-2xl font-semibold">
            {analytics.totalSpend.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {business.currency}
          </p>
        </div>
      </section>

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

      {/* Purchase History */}

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Purchase History</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Purchases made from this supplier.
          </p>
        </div>

        {analytics.purchases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Date</th>

                  <th className="px-5 py-3 text-left font-medium">Reference</th>

                  <th className="px-5 py-3 text-right font-medium">Items</th>

                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {analytics.purchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="transition hover:bg-muted/30"
                  >
                    <td className="px-5 py-4">
                      {new Date(
                        `${purchase.purchase_date}T00:00:00`,
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">{purchase.reference || "—"}</td>

                    <td className="px-5 py-4 text-right">
                      {analytics.purchaseItems
                        .filter((item) => item.purchase?.id === purchase.id)
                        .reduce((total, item) => total + item.quantity, 0)}
                    </td>

                    <td className="px-5 py-4 text-right font-medium">
                      {purchase.total_cost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {business.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium">No purchases recorded</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Purchases from this supplier will appear here.
            </p>
          </div>
        )}
      </section>

      {/* Cost Signals */}

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Cost Signals</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Recent purchase price changes from this supplier.
          </p>
        </div>

        {costSignals.length > 0 ? (
          <div className="divide-y">
            {costSignals.map((signal) => {
              const priceIncreased = signal.changePercentage > 0;
              const priceDecreased = signal.changePercentage < 0;

              return (
                <div key={signal.productId} className="space-y-4 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link
                        href={`/products/${signal.productId}`}
                        className="font-medium hover:text-blue-600"
                      >
                        {signal.productName}
                      </Link>

                      {signal.sku && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {signal.sku}
                        </p>
                      )}
                    </div>

                    <span
                      className={
                        priceIncreased
                          ? "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                          : priceDecreased
                            ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {priceIncreased
                        ? "Price increased"
                        : priceDecreased
                          ? "Price decreased"
                          : "No change"}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Previous purchase
                      </p>

                      <p className="mt-1 font-medium">
                        {signal.previousUnitCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {business.currency}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Latest purchase
                      </p>

                      <p className="mt-1 font-medium">
                        {signal.latestUnitCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {business.currency}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Change</p>

                      <p
                        className={`mt-1 font-medium ${
                          priceIncreased
                            ? "text-amber-600"
                            : priceDecreased
                              ? "text-green-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {signal.changePercentage >= 0 ? "+" : ""}
                        {signal.changePercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {priceIncreased && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-medium text-amber-900">
                        Purchase cost increased
                      </p>

                      <p className="mt-1 text-sm text-amber-800">
                        The latest recorded purchase price is higher than the
                        previous purchase from this supplier. This may put
                        pressure on the product&apos;s margin.
                      </p>
                    </div>
                  )}

                  {priceDecreased && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <p className="text-sm font-medium text-green-900">
                        Purchase cost decreased
                      </p>

                      <p className="mt-1 text-sm text-green-800">
                        The latest recorded purchase price is lower than the
                        previous purchase from this supplier.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium">Not enough purchase history</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Cost changes will appear after multiple purchases of the same
              product from this supplier.
            </p>
          </div>
        )}
      </section>

      {/* Margin Impact */}

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Margin Impact</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Products whose current margins may be affected by supplier cost
            changes.
          </p>
        </div>

        {costImpact.filter((item) => item.isBelowTarget).length > 0 ? (
          <div className="divide-y">
            {costImpact
              .filter((item) => item.isBelowTarget)
              .map((item) => (
                <div key={item.productId} className="space-y-4 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-medium hover:text-blue-600"
                      >
                        {item.productName}
                      </Link>

                      {item.sku && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.sku}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Below target
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current margin
                      </p>

                      <p className="mt-1 font-medium text-amber-600">
                        {item.contributionMargin?.toFixed(1)}%
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Target margin
                      </p>

                      <p className="mt-1 font-medium">
                        {item.targetMargin?.toFixed(1)}%
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Cost pressure
                      </p>

                      <p className="mt-1 font-medium text-amber-600">
                        +{" "}
                        {item.estimatedCostPressure.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {business.currency} / unit
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-900">
                      Potential margin pressure
                    </p>

                    <p className="mt-1 text-sm text-amber-800">
                      The latest purchase price is higher than the previous
                      price, while this product is already below its target
                      margin.
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium">
              No current margin pressure detected
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              No products supplied by this supplier currently show both a recent
              price increase and a below-target margin.
            </p>
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
