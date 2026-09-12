import Link from "next/link";
import { getCurrentBusiness } from "@/lib/services/business";
import { getMarginAnalysis } from "@/lib/services/marginAnalysis";
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

function formatPercent(value: number) {
  return `${formatNumber(value)}%`;
}

export default async function MarginsAnalysisPage({
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

  const data = await getMarginAnalysis(business.id, range, business.timezone);

  const currency = business.currency;

  const marginImproved = data.marginChange >= 0;

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Analysis</p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Margins
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            See how much of your revenue you keep after product and direct
            costs.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
          {[7, 30, 90].map((days) => (
            <Link
              key={days}
              href={`/analysis/margins?range=${days}`}
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
          <p className="text-sm text-muted-foreground">Revenue</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {formatCurrency(data.revenue, currency)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Net product revenue
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Contribution</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {formatCurrency(data.contribution, currency)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            After direct product costs
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Contribution Margin</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {formatPercent(data.margin)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Target: {formatPercent(data.targetMargin)}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Margin Change</p>

          <p
            className={`mt-2 text-2xl font-semibold tracking-tight ${
              marginImproved ? "text-foreground" : "text-destructive"
            }`}
          >
            {marginImproved ? "+" : ""}
            {formatPercent(data.marginChange)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Compared with previous period
          </p>
        </div>
      </div>

      {/* Margin status */}
      <section className="rounded-xl border bg-card p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Margin Health</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Your current contribution margin compared with the weighted
              target.
            </p>
          </div>

          <div className="text-left md:text-right">
            <p
              className={`text-3xl font-semibold ${
                data.marginGap >= 0 ? "text-foreground" : "text-destructive"
              }`}
            >
              {data.marginGap >= 0 ? "+" : ""}
              {formatPercent(data.marginGap)}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {data.marginGap >= 0 ? "Above target" : "Below target"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative h-3 rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-foreground"
              style={{
                width: `${Math.min(Math.max(data.margin, 0), 100)}%`,
              }}
            />

            <div
              className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-muted-foreground"
              style={{
                left: `${Math.min(Math.max(data.targetMargin, 0), 100)}%`,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>

            <span>Target {formatPercent(data.targetMargin)}</span>

            <span>100%</span>
          </div>
        </div>
      </section>

      {/* Trend */}
      <section className="rounded-xl border bg-card">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">Margin Trend</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Weekly contribution margin during the selected period.
          </p>
        </div>

        {data.trend.weeks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium">No margin data yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Record sales to start tracking margin movement.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto p-5">
            <div className="min-w-[650px]">
              <div className="flex h-64 items-end gap-3 border-b border-l px-4 pb-0">
                {data.trend.weeks.map((week) => {
                  const height = Math.min(Math.max(week.margin, 0), 100);

                  return (
                    <div
                      key={week.week}
                      className="flex h-full flex-1 flex-col justify-end"
                    >
                      <div className="mb-2 text-center text-xs font-medium">
                        {formatPercent(week.margin)}
                      </div>

                      <div
                        className="w-full rounded-t-md bg-foreground/80 transition hover:bg-foreground"
                        style={{
                          height: `${height}%`,
                          minHeight: week.margin > 0 ? "4px" : "0px",
                        }}
                        title={`${week.week}: ${formatPercent(week.margin)}`}
                      />

                      <div className="mt-3 text-center text-xs text-muted-foreground">
                        {week.week}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                <span>Target: {formatPercent(data.targetMargin)}</span>

                <span>
                  {data.trend.weeks.length}{" "}
                  {data.trend.weeks.length === 1 ? "week" : "weeks"}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Product performance */}
      <section className="rounded-xl border bg-card">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">Product Margin Performance</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Products are ordered by their gap against target margin.
          </p>
        </div>

        {data.products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium">No product margin data yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Products need sales before margin performance can be evaluated.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Product</th>

                  <th className="px-5 py-3 text-right font-medium">Revenue</th>

                  <th className="px-5 py-3 text-right font-medium">
                    Contribution
                  </th>

                  <th className="px-5 py-3 text-right font-medium">Margin</th>

                  <th className="px-5 py-3 text-right font-medium">Target</th>

                  <th className="px-5 py-3 text-right font-medium">Gap</th>

                  <th className="px-5 py-3 text-right font-medium">Units</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {data.products.map((product) => {
                  const belowTarget = product.marginGap < 0;

                  return (
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
                        {formatCurrency(product.revenue, currency)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {formatCurrency(product.contribution, currency)}
                      </td>

                      <td className="px-5 py-4 text-right font-medium">
                        {formatPercent(product.margin)}
                      </td>

                      <td className="px-5 py-4 text-right text-muted-foreground">
                        {formatPercent(product.targetMargin)}
                      </td>

                      <td
                        className={`px-5 py-4 text-right font-medium ${
                          belowTarget ? "text-destructive" : "text-foreground"
                        }`}
                      >
                        {product.marginGap >= 0 ? "+" : ""}
                        {formatPercent(product.marginGap)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {formatNumber(product.unitsSold)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Attention */}
      {data.products.length > 0 && data.products[0].marginGap < 0 && (
        <section className="rounded-xl border bg-muted/30 p-5">
          <p className="text-sm font-medium">Margin attention</p>

          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {data.products[0].productName}
            </span>{" "}
            has the largest gap against its target margin. Review its selling
            price, purchase cost, and direct costs.
          </p>
        </section>
      )}
    </div>
  );
}
