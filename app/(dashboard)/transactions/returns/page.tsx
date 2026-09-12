import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getReturnListData } from "@/lib/services/returnList";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export default async function ReturnsPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const returns = await getReturnListData(business.id);

  return (
    <main className="space-y-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/transactions"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to transactions
          </Link>

          <h1 className="mt-4 text-2xl font-semibold">Returns</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Record and review product returns, refunds, and return-related
            costs.
          </p>
        </div>

        <Link
          href="/transactions/returns/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Record Return
        </Link>
      </div>

      {returns.length === 0 ? (
        <div className="rounded-xl border bg-background p-8 text-center">
          <h2 className="font-semibold">No returns recorded</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Returns you record will appear here.
          </p>

          <Link
            href="/transactions/returns/new"
            className="mt-5 inline-flex rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Record your first return
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b">
                  <th className="px-5 py-3 text-left font-medium">Date</th>

                  <th className="px-5 py-3 text-left font-medium">Sale</th>

                  <th className="px-5 py-3 text-left font-medium">Product</th>

                  <th className="px-5 py-3 text-right font-medium">Qty</th>

                  <th className="px-5 py-3 text-right font-medium">Refund</th>

                  <th className="px-5 py-3 text-right font-medium">
                    Return Costs
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Total Impact
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {returns.map((returnRecord) => (
                  <tr key={returnRecord.id} className="hover:bg-muted/30">
                    <td className="px-5 py-4 whitespace-nowrap">
                      {formatDate(returnRecord.return_date)}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/transactions/returns/${returnRecord.id}`}
                        className="font-medium hover:underline"
                      >
                        {returnRecord.sale?.reference ?? "—"}
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {returnRecord.product?.name ?? "—"}
                      </p>

                      {returnRecord.product?.sku && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {returnRecord.product.sku}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {returnRecord.quantity}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatMoney(returnRecord.refund_amount)}{" "}
                      {business.currency}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatMoney(returnRecord.returnCosts)}{" "}
                      {business.currency}
                    </td>

                    <td className="px-5 py-4 text-right font-medium">
                      {formatMoney(returnRecord.totalImpact)}{" "}
                      {business.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
