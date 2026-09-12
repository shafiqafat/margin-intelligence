import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getSaleById } from "@/lib/services/sales";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString();
}

export default async function SaleDetailPage({
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

  const sale = await getSaleById(business.id, id);

  if (!sale) {
    return (
      <main className="space-y-4 p-8">
        <Link
          href="/transactions/sales"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to sales
        </Link>

        <h1 className="text-2xl font-semibold">Sale not found</h1>
      </main>
    );
  }

  const productRevenue = sale.sale_items.reduce(
    (total, item) => total + item.total_price,
    0,
  );

  const collectedRevenue = productRevenue + sale.shipping_revenue;


  return (
    <main className="space-y-6 p-8">
      <div>
        <Link
          href="/transactions/sales"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to sales
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold">Sale Details</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Review the products, revenue, and selling costs for this sale.
          </p>
        </div>
      </div>

      {/* Sale Information */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Sale Information</h2>
        </div>

        <div className="grid grid-cols-4 gap-6 px-5 py-5">
          <div>
            <p className="text-sm text-muted-foreground">Sale date</p>

            <p className="mt-1 font-medium">{formatDate(sale.sale_date)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Reference</p>

            <p className="mt-1 font-medium">{sale.reference || "—"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Recorded</p>

            <p className="mt-1 font-medium">
              {new Date(sale.created_at).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Items</p>

            <p className="mt-1 font-medium">
              {sale.sale_items.reduce(
                (total, item) => total + item.quantity,
                0,
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Sale Items */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Sale Items</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Products and their recorded selling prices.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Product</th>

                <th className="px-5 py-3 text-left font-medium">SKU</th>

                <th className="px-5 py-3 text-right font-medium">Quantity</th>

                <th className="px-5 py-3 text-right font-medium">Unit Price</th>

                <th className="px-5 py-3 text-right font-medium">Discount</th>

                <th className="px-5 py-3 text-right font-medium">Item Total</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {sale.sale_items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 font-medium">
                    {item.product?.name ?? "Unknown product"}
                  </td>

                  <td className="px-5 py-4 text-muted-foreground">
                    {item.product?.sku ?? "—"}
                  </td>

                  <td className="px-5 py-4 text-right">{item.quantity}</td>

                  <td className="px-5 py-4 text-right">
                    {formatMoney(item.unit_price)} {business.currency}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {formatMoney(item.discount)} {business.currency}
                  </td>

                  <td className="px-5 py-4 text-right font-medium">
                    {formatMoney(item.total_price)} {business.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Revenue Summary */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Revenue & Selling Costs</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Revenue and costs recorded against this sale.
          </p>
        </div>

        <div className="space-y-6 p-5">
          {/* Revenue */}
          <div>
            <h3 className="text-sm font-medium">Revenue</h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Product revenue</span>

                <span>
                  {productRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {business.currency}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping revenue</span>

                <span>
                  {sale.shipping_revenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {business.currency}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Collected revenue</span>

                  <span className="font-semibold">
                    {collectedRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {business.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selling Costs */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium">Selling Costs</h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Delivery cost</span>

                <span>
                  {sale.delivery_cost.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {business.currency}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment fee</span>

                <span>
                  {sale.payment_fee.toLocaleString(undefined, {
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
