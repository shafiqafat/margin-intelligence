import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getPurchaseListData } from "@/lib/services/purchaseList";

export default async function PurchasesPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const purchases = await getPurchaseListData(business.id);

  return (
    <main className="space-y-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Purchases</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Track products purchased from suppliers and their costs.
          </p>
        </div>

        <Link
          href="/transactions/purchases/new"
          className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Record Purchase
        </Link>
      </div>

      <div className="rounded-xl border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Date</th>

                <th className="px-5 py-3 text-left font-medium">Supplier</th>

                <th className="px-5 py-3 text-left font-medium">Reference</th>

                <th className="px-5 py-3 text-right font-medium">Items</th>

                <th className="px-5 py-3 text-right font-medium">Subtotal</th>

                <th className="px-5 py-3 text-right font-medium">
                  Extra Costs
                </th>

                <th className="px-5 py-3 text-right font-medium">Total Cost</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="transition hover:bg-muted/30">
                  <td className="px-5 py-4">
                    {new Date(
                      `${purchase.purchase_date}T00:00:00`,
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-4 font-medium">
                    <Link
                      href={`/transactions/purchases/${purchase.id}`}
                      className="transition hover:text-blue-600"
                    >
                      {purchase.supplier?.name ?? "—"}
                    </Link>
                  </td>

                  <td className="px-5 py-4 text-muted-foreground">
                    {purchase.reference || "—"}
                  </td>

                  <td className="px-5 py-4 text-right">{purchase.itemCount}</td>

                  <td className="px-5 py-4 text-right">
                    {purchase.subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {business.currency}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {purchase.extraCosts.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {business.currency}
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

              {purchases.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-muted-foreground"
                  >
                    No purchases recorded yet.
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
