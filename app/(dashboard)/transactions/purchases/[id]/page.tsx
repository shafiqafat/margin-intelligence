import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getPurchaseById } from "@/lib/services/purchases";

export default async function PurchaseDetailsPage({
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

  const purchase = await getPurchaseById(business.id, id);

  if (!purchase) {
    return (
      <main className="p-8">
        <Link
          href="/transactions/purchases"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to purchases
        </Link>

        <h1 className="mt-6 text-2xl font-semibold">Purchase not found</h1>
      </main>
    );
  }

  return (
    <main className="space-y-8 p-8">
      {/* Header */}

      <div>
        <Link
          href="/transactions/purchases"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to purchases
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold">Purchase Details</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Review the products, costs, and allocation for this purchase.
          </p>
        </div>
      </div>

      {/* Purchase Information */}

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Purchase Information</h2>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Supplier</p>

            <p className="mt-1 font-medium">{purchase.supplier?.name ?? "—"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Purchase date</p>

            <p className="mt-1 font-medium">
              {new Date(purchase.purchase_date).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Reference</p>

            <p className="mt-1 font-medium">{purchase.reference || "—"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Recorded</p>

            <p className="mt-1 font-medium">
              {new Date(purchase.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {purchase.notes && (
          <div className="border-t p-5">
            <p className="text-sm text-muted-foreground">Notes</p>

            <p className="mt-1 text-sm leading-6">{purchase.notes}</p>
          </div>
        )}
      </section>

      {/* Purchase Items */}

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Purchase Items</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Products and their recorded acquisition costs.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Product</th>

                <th className="px-5 py-3 text-left font-medium">SKU</th>

                <th className="px-5 py-3 text-right font-medium">Quantity</th>

                <th className="px-5 py-3 text-right font-medium">Unit Cost</th>

                <th className="px-5 py-3 text-right font-medium">Item Total</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {purchase.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 font-medium">
                    {item.product?.name ?? "—"}
                  </td>

                  <td className="px-5 py-4 text-muted-foreground">
                    {item.product?.sku ?? "—"}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {item.quantity.toLocaleString()}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {item.unit_cost.toLocaleString()} {business.currency}
                  </td>

                  <td className="px-5 py-4 text-right font-medium">
                    {item.total_cost.toLocaleString()} {business.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cost Summary */}

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border bg-background">
          <div className="border-b p-5">
            <h2 className="font-semibold">Cost Allocation</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Shows how shared purchase costs are added to each product&apos;s
              acquisition cost.
            </p>
          </div>

          {purchase.allocations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Product</th>

                    <th className="px-5 py-3 text-right font-medium">
                      Item Cost
                    </th>

                    <th className="px-5 py-3 text-right font-medium">
                      Shared Cost
                    </th>

                    <th className="px-5 py-3 text-right font-medium">
                      True Cost
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {purchase.allocations.map((allocation) => {
                    const item = purchase.items.find(
                      (item) => item.product_id === allocation.product_id,
                    );

                    const product = item?.product;

                    const itemCost = item?.total_cost ?? 0;

                    const trueCost = itemCost + allocation.amount;

                    return (
                      <tr key={allocation.id}>
                        <td className="px-5 py-4 font-medium">
                          {product?.name ?? "—"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {itemCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {business.currency}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {allocation.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {business.currency}
                        </td>

                        <td className="px-5 py-4 text-right font-medium">
                          {trueCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {business.currency}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No shared costs were allocated to this purchase.
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-background p-5">
          <h2 className="font-semibold">Cost Summary</h2>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>

              <span>
                {purchase.subtotal.toLocaleString()} {business.currency}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>

              <span>
                {purchase.shipping_cost.toLocaleString()} {business.currency}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Additional cost</span>

              <span>
                {purchase.additional_cost.toLocaleString()} {business.currency}
              </span>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="font-semibold">Total Cost</span>

                <span className="font-semibold">
                  {purchase.total_cost.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {business.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
