import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getPurchases } from "@/lib/services/purchases";
import { getSales } from "@/lib/services/sales";
import { getReturns } from "@/lib/services/returns";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default async function TransactionsPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const [purchases, sales, returns] = await Promise.all([
    getPurchases(business.id),
    getSales(business.id),
    getReturns(business.id),
  ]);

  const totalPurchaseSpend = purchases.reduce(
    (total, purchase) => total + purchase.total_cost,
    0,
  );

  const totalSalesRevenue = sales.reduce(
    (total, sale) => total + sale.total_revenue,
    0,
  );

  const totalRefunds = returns.reduce(
    (total, returnRecord) => total + returnRecord.refund_amount,
    0,
  );

  const transactionTypes = [
    {
      title: "Purchases",
      description:
        "Record products acquired from suppliers and the costs associated with them.",
      metric: `${purchases.length} ${
        purchases.length === 1 ? "purchase" : "purchases"
      }`,
      secondaryMetric: `${formatMoney(
        totalPurchaseSpend,
      )} ${business.currency} total spend`,
      href: "/transactions/purchases",
      action: "View Purchases",
    },
    {
      title: "Sales",
      description:
        "Record products sold, revenue collected, and costs associated with fulfilling each sale.",
      metric: `${sales.length} ${sales.length === 1 ? "sale" : "sales"}`,
      secondaryMetric: `${formatMoney(
        totalSalesRevenue,
      )} ${business.currency} recorded revenue`,
      href: "/transactions/sales",
      action: "View Sales",
    },
    {
      title: "Returns",
      description:
        "Record returned products, refunds, and return-related costs.",
      metric: `${returns.length} ${
        returns.length === 1 ? "return" : "returns"
      }`,
      secondaryMetric: `${formatMoney(
        totalRefunds,
      )} ${business.currency} refunded`,
      href: "/transactions/returns",
      action: "View Returns",
    },
  ];

  return (
    <main className="space-y-6 p-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Transactions
        </p>

        <h1 className="mt-2 text-2xl font-semibold">Transactions</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Record and review your business activity.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {transactionTypes.map((transaction) => (
          <Link
            key={transaction.href}
            href={transaction.href}
            className="group rounded-xl border bg-background p-6 transition-colors hover:bg-muted/40"
          >
            <h2 className="text-lg font-semibold">{transaction.title}</h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {transaction.description}
            </p>

            <div className="mt-8">
              <p className="text-lg font-semibold">{transaction.metric}</p>

              <p className="mt-1 text-sm text-muted-foreground">
                {transaction.secondaryMetric}
              </p>
            </div>

            <div className="mt-6 text-sm font-medium text-primary">
              {transaction.action} →
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
