import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getReturnById } from "@/lib/services/returns";

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
  }).format(new Date(`${date}T00:00:00`));
}

export default async function ReturnDetailPage({
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

  const returnRecord = await getReturnById(business.id, id);

  if (!returnRecord) {
    return (
      <main className="p-8">
        <Link
          href="/transactions/sales"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Sales
        </Link>

        <h1 className="mt-6 text-2xl font-semibold">Return not found</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          This return does not exist or you do not have access to it.
        </p>
      </main>
    );
  }

  const totalReturnCosts =
    returnRecord.return_shipping_cost + returnRecord.restocking_cost;

  const totalReturnImpact = returnRecord.refund_amount + totalReturnCosts;

  return (
    <main className="space-y-6 p-8">
      <div>
        <Link
          href="/transactions/sales"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Sales
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold">Return Details</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Review the returned product and its financial impact.
          </p>
        </div>
      </div>

      {/* Return Information */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Return Information</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Recorded details for this return.
          </p>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Return Date</p>

            <p className="mt-1 font-medium">
              {formatDate(returnRecord.return_date)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Original Sale</p>

            <p className="mt-1 font-medium">
              {returnRecord.sale?.reference ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Product</p>

            <p className="mt-1 font-medium">
              {returnRecord.product?.name ?? "—"}
            </p>

            {returnRecord.product?.sku && (
              <p className="mt-1 text-xs text-muted-foreground">
                {returnRecord.product.sku}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Quantity</p>

            <p className="mt-1 font-medium">{returnRecord.quantity}</p>
          </div>
        </div>
      </section>

      {/* Return Details */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Return Details</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Reason and notes recorded with the return.
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <p className="text-sm text-muted-foreground">Reason</p>

            <p className="mt-1 text-sm">{returnRecord.reason || "—"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Notes</p>

            <p className="mt-1 text-sm">{returnRecord.notes || "—"}</p>
          </div>
        </div>
      </section>

      {/* Financial Impact */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Financial Impact</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Revenue refunded and costs associated with processing this return.
          </p>
        </div>

        <div className="space-y-6 p-5">
          <div>
            <h3 className="text-sm font-medium">Refund</h3>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Refund amount
              </span>

              <span className="font-medium">
                {formatMoney(returnRecord.refund_amount)} {business.currency}
              </span>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-medium">Return Costs</h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Return shipping cost
                </span>

                <span>
                  {formatMoney(returnRecord.return_shipping_cost)}{" "}
                  {business.currency}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Restocking cost</span>

                <span>
                  {formatMoney(returnRecord.restocking_cost)}{" "}
                  {business.currency}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total return costs</span>

                  <span className="font-semibold">
                    {formatMoney(totalReturnCosts)} {business.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Total financial impact</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Refund plus return-related costs.
                </p>
              </div>

              <p className="text-lg font-semibold">
                {formatMoney(totalReturnImpact)} {business.currency}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
