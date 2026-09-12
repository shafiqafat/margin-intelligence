import Link from "next/link";
import { getCurrentBusiness } from "@/lib/services/business";
import { getProfitabilityAnalysis } from "@/lib/services/profitabilityAnalysis";
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

export default async function ProfitabilityAnalysisPage({
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

  const data = await getProfitabilityAnalysis(
    business.id,
    range,
    business.timezone,
  );

  const currency = business.currency;

  const revenueImproved = data.revenueChange >= 0;
  const contributionImproved = data.contributionChange >= 0;
  const marginImproved = data.marginChange >= 0;

  const bestProduct = data.products[0];

  const attentionProducts = data.products.filter(
    (product) => product.contribution < 0,
  );

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Analysis</p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Profitability
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Understand which products are generating contribution and where
            profitability is being lost.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
          {[7, 30, 90].map((days) => (
            <Link
              key={days}
              href={`/analysis/profitability?range=${days}`}
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
        <MetricCard
          label="Revenue"
          value={formatCurrency(data.revenue, currency)}
          detail={
            <>
              <span
                className={
                  revenueImproved
                    ? "font-medium text-foreground"
                    : "font-medium text-destructive"
                }
              >
                {revenueImproved ? "+" : ""}
                {formatCurrency(data.revenueChange, currency)}
              </span>{" "}
              vs previous period
            </>
          }
        />

        <MetricCard
          label="Contribution"
          value={formatCurrency(data.contribution, currency)}
          detail={
            <>
              <span
                className={
                  contributionImproved
                    ? "font-medium text-foreground"
                    : "font-medium text-destructive"
                }
              >
                {contributionImproved ? "+" : ""}
                {formatCurrency(data.contributionChange, currency)}
              </span>{" "}
              vs previous period
            </>
          }
        />

        <MetricCard
          label="Contribution Margin"
          value={formatPercent(data.contributionMargin)}
          detail={
            <>
              <span
                className={
                  marginImproved
                    ? "font-medium text-foreground"
                    : "font-medium text-destructive"
                }
              >
                {marginImproved ? "+" : ""}
                {formatPercent(data.marginChange)}
              </span>{" "}
              vs previous period
            </>
          }
        />

        <MetricCard
          label="Products Sold"
          value={formatNumber(data.products.length)}
          detail="Products with revenue in this period"
        />
      </div>

      {/* Overview */}
      <section className="rounded-xl border bg-card">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">Profitability Overview</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Revenue retained after product-level contribution costs.
          </p>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-3">
          <OverviewItem
            label="Revenue"
            value={formatCurrency(data.revenue, currency)}
          />

          <OverviewItem
            label="Contribution"
            value={formatCurrency(data.contribution, currency)}
          />

          <OverviewItem
            label="Contribution Margin"
            value={formatPercent(data.contributionMargin)}
          />
        </div>
      </section>

      {/* Product profitability */}
      <section className="rounded-xl border bg-card">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">Product Profitability</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Products are ranked by contribution generated during the selected
            period.
          </p>
        </div>

        {data.products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium">No profitability data yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Record sales to start evaluating product profitability.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Product</th>

                  <th className="px-5 py-3 text-right font-medium">Revenue</th>

                  <th className="px-5 py-3 text-right font-medium">
                    True Cost / Unit
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Contribution
                  </th>

                  <th className="px-5 py-3 text-right font-medium">Margin</th>

                  <th className="px-5 py-3 text-right font-medium">Target</th>

                  <th className="px-5 py-3 text-right font-medium">Gap</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {data.products.map((product) => {
                  const lossMaking = product.contribution < 0;

                  const marginBelowTarget =
                    product.contributionMargin < product.targetMargin;

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
                      </td>

                      <td className="px-5 py-4 text-right">
                        {formatCurrency(product.netRevenue, currency)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {formatCurrency(product.trueUnitCost, currency)}
                      </td>

                      <td
                        className={`px-5 py-4 text-right font-medium ${
                          lossMaking ? "text-destructive" : ""
                        }`}
                      >
                        {formatCurrency(product.contribution, currency)}
                      </td>

                      <td
                        className={`px-5 py-4 text-right font-medium ${
                          marginBelowTarget ? "text-destructive" : ""
                        }`}
                      >
                        {formatPercent(product.contributionMargin)}
                      </td>

                      <td className="px-5 py-4 text-right text-muted-foreground">
                        {formatPercent(product.targetMargin)}
                      </td>

                      <td
                        className={`px-5 py-4 text-right font-medium ${
                          marginBelowTarget ? "text-destructive" : ""
                        }`}
                      >
                        {product.marginGap >= 0 ? "+" : ""}
                        {formatPercent(product.marginGap)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Best performer */}
      {bestProduct && (
        <section className="rounded-xl border bg-card p-5">
          <p className="text-sm font-medium">Top contributor</p>

          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href={`/products/${bestProduct.productId}`}
                className="text-lg font-semibold hover:underline"
              >
                {bestProduct.productName}
              </Link>

              <p className="mt-1 text-sm text-muted-foreground">
                Generated {formatCurrency(bestProduct.contribution, currency)}{" "}
                in contribution at a{" "}
                {formatPercent(bestProduct.contributionMargin)} margin.
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-2xl font-semibold">
                {formatCurrency(bestProduct.contribution, currency)}
              </p>

              <p className="text-xs text-muted-foreground">Contribution</p>
            </div>
          </div>
        </section>
      )}

      {/* Loss-making products */}
      {attentionProducts.length > 0 && (
        <section className="rounded-xl border bg-muted/30 p-5">
          <p className="text-sm font-medium">Profitability attention</p>

          <p className="mt-2 text-sm text-muted-foreground">
            {attentionProducts.length}{" "}
            {attentionProducts.length === 1 ? "product is" : "products are"}{" "}
            currently generating negative contribution. Review their purchase
            costs, selling prices, and selling costs.
          </p>
        </section>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>

      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function OverviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
