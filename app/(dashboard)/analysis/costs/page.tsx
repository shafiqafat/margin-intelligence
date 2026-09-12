import Link from "next/link";
import { getCurrentBusiness } from "@/lib/services/business";
import { getCostAnalysis } from "@/lib/services/costAnalysis";
import type { DashboardRange } from "@/types/dashboard";

type SearchParams = Promise<{
  range?: string;
}>;

function getValidRange(value?: string): DashboardRange {
  if (value === "7" || value === "30" || value === "90") {
    return Number(value) as DashboardRange;
  }

  return 30;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatChange(value: number, currency: string) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatCurrency(value, currency)}`;
}

export default async function CostsAnalysisPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Business not found</h1>
      </div>
    );
  }

  const params = await searchParams;
  const range = getValidRange(params.range);

  const data = await getCostAnalysis(business.id, range, business.timezone);

  const currency = business.currency;

  const topMovement = data.movements[0];

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Analysis</p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Costs</h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Understand where your money is going and which costs are changing.
          </p>
        </div>

        {/* Range */}
        <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
          {[7, 30, 90].map((days) => (
            <Link
              key={days}
              href={`/analysis/costs?range=${days}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                range === days
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {days} days
            </Link>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Costs</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {formatCurrency(data.current.total, currency)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">Selected period</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Purchase Costs</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {formatCurrency(data.current.purchaseCosts, currency)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Product acquisition
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Direct Costs</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {formatCurrency(data.current.directCosts, currency)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Product-linked expenses
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Cost Change</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {formatChange(data.current.total - data.previous.total, currency)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Compared with previous period
          </p>
        </div>
      </div>

      {/* Cost breakdown */}
      <section className="rounded-xl border bg-card">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">Cost Breakdown</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Where your costs came from during this period.
          </p>
        </div>

        <div className="divide-y">
          <CostRow
            label="Purchase costs"
            description="Product acquisition"
            amount={data.current.purchaseCosts}
            total={data.current.total}
            currency={currency}
          />

          <CostRow
            label="Direct costs"
            description="Product-linked expenses"
            amount={data.current.directCosts}
            total={data.current.total}
            currency={currency}
          />

          <CostRow
            label="Delivery"
            description="Delivery costs on sales"
            amount={data.current.delivery}
            total={data.current.total}
            currency={currency}
          />

          <CostRow
            label="Payment fees"
            description="Payment processing costs"
            amount={data.current.paymentFees}
            total={data.current.total}
            currency={currency}
          />

          <CostRow
            label="Returns"
            description="Return shipping and restocking"
            amount={data.current.returns}
            total={data.current.total}
            currency={currency}
          />
        </div>
      </section>

      {/* Movement */}
      <section className="rounded-xl border bg-card">
        <div className="flex flex-col gap-2 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Cost Movement</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              What changed compared with the previous period.
            </p>
          </div>

          {topMovement && (
            <div className="text-sm text-muted-foreground">
              Biggest movement:{" "}
              <span className="font-medium text-foreground">
                {topMovement.name}
              </span>
            </div>
          )}
        </div>

        {data.movements.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium">No significant cost movement</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Your costs were unchanged between the two periods.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {data.movements.map((movement) => {
              const increased = movement.amount > 0;

              return (
                <div
                  key={movement.category}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{movement.name}</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {movement.description}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p
                      className={`font-semibold ${
                        increased ? "text-destructive" : "text-foreground"
                      }`}
                    >
                      {formatChange(movement.amount, currency)}
                    </p>

                    {movement.percentage > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatNumber(movement.percentage)}% of total increases
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Product costs */}
      <section className="rounded-xl border bg-card">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">Cost by Product</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Products with the highest accumulated true costs.
          </p>
        </div>

        {data.products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium">No product cost data yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Record purchases to start analyzing product costs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Product</th>

                  <th className="px-5 py-3 text-right font-medium">
                    Purchased
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Purchase Cost
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Direct Costs
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    True Cost
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Cost / Unit
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {data.products.map((product) => (
                  <tr
                    key={product.productId}
                    className="transition hover:bg-muted/40"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/products/${product.productId}`}
                        className="font-medium hover:underline"
                      >
                        {product.productName}
                      </Link>

                      {product.sku && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {product.sku}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatNumber(product.purchasedQuantity)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatCurrency(product.purchaseCosts, currency)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {formatCurrency(product.directCosts, currency)}
                    </td>

                    <td className="px-5 py-4 text-right font-medium">
                      {formatCurrency(product.trueCost, currency)}
                    </td>

                    <td className="px-5 py-4 text-right font-medium">
                      {formatCurrency(product.trueCostPerUnit, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Insight */}
      {topMovement && topMovement.amount > 0 && (
        <section className="rounded-xl border bg-muted/30 p-5">
          <p className="text-sm font-medium">Cost attention</p>

          <p className="mt-2 text-sm text-muted-foreground">
            {topMovement.name} was the largest source of increased costs during
            this period, changing by{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(topMovement.amount, currency)}
            </span>
            .
          </p>
        </section>
      )}
    </div>
  );
}

function CostRow({
  label,
  description,
  amount,
  total,
  currency,
}: {
  label: string;
  description: string;
  amount: number;
  total: number;
  currency: string;
}) {
  const percentage = total > 0 ? (amount / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{label}</p>

        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="text-left sm:text-right">
        <p className="font-semibold">{formatCurrency(amount, currency)}</p>

        <p className="mt-1 text-xs text-muted-foreground">
          {formatNumber(percentage)}% of total
        </p>
      </div>
    </div>
  );
}
