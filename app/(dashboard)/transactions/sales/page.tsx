import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getSaleListData } from "@/lib/services/saleList";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function SalesPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return <div>Business not found.</div>;
  }

  const sales = await getSaleListData(business.id);

  return (
    <main className="space-y-6 p-8">
      <div>
        <Link
          href="/transactions"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to transactions
        </Link>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Sales</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Record and review your sales transactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/transactions/returns/new"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Record Return
            </Link>

            <Link
              href="/transactions/sales/new"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Create Sale
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-background">
        <div className="overflow-x-auto">
          {sales.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-medium">No sales recorded yet.</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Record your first sale to start tracking revenue and
                profitability.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Date</th>

                  <th className="px-5 py-3 text-left font-medium">Reference</th>

                  <th className="px-5 py-3 text-right font-medium">Items</th>

                  <th className="px-5 py-3 text-right font-medium">
                    Delivery Cost
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Payment Fee
                  </th>

                  <th className="px-5 py-3 text-right font-medium">Discount</th>

                  <th className="px-5 py-3 text-right font-medium">Revenue</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-5 py-4">{formatDate(sale.sale_date)}</td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/transactions/sales/${sale.id}`}
                        className="font-medium hover:underline"
                      >
                        {sale.reference || "—"}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-right">{sale.itemCount}</td>

                    <td className="px-5 py-4 text-right">
                      {formatMoney(sale.delivery_cost)} {business.currency}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatMoney(sale.payment_fee)} {business.currency}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatMoney(sale.discount)} {business.currency}
                    </td>

                    <td className="px-5 py-4 text-right font-medium">
                      {formatMoney(sale.total_revenue)} {business.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
