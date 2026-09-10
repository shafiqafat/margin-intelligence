import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getInsightById } from "@/lib/services/insights";
import { getProductProfitability } from "@/lib/services/profitability";

export default async function InsightDetailPage({
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

  const insight = await getInsightById(business.id, id);

  if (!insight) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Insight not found</h1>

        <Link
          href="/insights"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          ← Back to insights
        </Link>
      </main>
    );
  }

  const product =
    insight.entity_type === "product" && insight.entity_id
      ? await getProductProfitability(business.id, insight.entity_id)
      : null;

  return (
    <main className="space-y-8 p-8">
      {/* Header */}
      <div>
        <Link
          href="/insights"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to insights
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">{insight.title}</h1>

              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                {insight.severity}
              </span>

              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {insight.status}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {insight.description}
            </p>
          </div>
        </div>
      </div>

      {/* Financial impact */}
      <section className="rounded-xl border bg-background p-6">
        <p className="text-sm text-muted-foreground">
          Estimated financial impact
        </p>

        <p className="mt-1 text-3xl font-semibold text-red-600">
          {insight.financial_impact?.toLocaleString()} {business.currency}
        </p>
      </section>

      {/* Explanation */}
      <section className="rounded-xl border bg-background p-6">
        <h2 className="text-lg font-semibold">What we found</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              What happened
            </p>

            <p className="mt-2 text-sm leading-6">{insight.what_happened}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Why it matters
            </p>

            <p className="mt-2 text-sm leading-6">{insight.why_it_matters}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">
              What to investigate
            </p>

            <p className="mt-2 text-sm leading-6">
              {insight.what_to_investigate}
            </p>
          </div>
        </div>
      </section>

      {/* Product evidence */}
      {product && (
        <section className="rounded-xl border bg-background p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Product evidence</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Current profitability data behind this insight.
              </p>
            </div>

            <Link
              href={`/products/${product.productId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              View product →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Net revenue</p>

              <p className="mt-1 font-semibold">
                {product.netRevenue.toLocaleString()} {business.currency}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">True cost / unit</p>

              <p className="mt-1 font-semibold">
                {product.trueUnitCost.toLocaleString()} {business.currency}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Contribution</p>

              <p className="mt-1 font-semibold">
                {product.contribution.toLocaleString()} {business.currency}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">
                Contribution margin
              </p>

              <p className="mt-1 font-semibold">
                {product.contributionMargin.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Cost drivers */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-sm font-semibold">Cost drivers</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              The main costs contributing to this product&apos;s current
              profitability.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Purchase cost</p>

                <p className="mt-1 font-semibold">
                  {product.purchaseCost.toLocaleString()} {business.currency}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Direct costs</p>

                <p className="mt-1 font-semibold">
                  {product.directExpenses.toLocaleString()} {business.currency}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Return costs</p>

                <p className="mt-1 font-semibold">
                  {product.returnCosts.toLocaleString()} {business.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Margin target */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-sm font-semibold">Margin target</h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Actual margin</p>

                <p className="mt-1 text-lg font-semibold">
                  {product.contributionMargin.toFixed(1)}%
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Target margin</p>

                <p className="mt-1 text-lg font-semibold">
                  {product.targetMargin.toFixed(1)}%
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Margin gap</p>

                <p className="mt-1 text-lg font-semibold text-red-600">
                  {product.marginGap.toFixed(1)} pts
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
