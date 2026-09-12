import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getProductById } from "@/lib/services/products";
import { getProductProfitability } from "@/lib/services/profitability";
import { getProductSuppliers } from "@/lib/services/suppliers";

import { DeactivateProductButton } from "@/components/products/DeactivateProductButton";
import { getProductInsights, syncInsights } from "@/lib/services/intelligence";

export default async function ProductPage({
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

  const product = await getProductById(business.id, id);

  if (!product) {
    return (
      <main className="p-8">
        <Link
          href="/products"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to products
        </Link>

        <h1 className="mt-6 text-2xl font-semibold">Product not found</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          This product does not exist or you don&apos;t have access to it.
        </p>
      </main>
    );
  }

  const [profitability, suppliers] = await Promise.all([
    getProductProfitability(business.id, id),
    getProductSuppliers(business.id, id),
  ]);

  if (!profitability) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">
          Profitability data unavailable
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          We could not calculate profitability for this product.
        </p>
      </main>
    );
  }

  await syncInsights(business.id);

  const insights = await getProductInsights(business.id, id);

  return (
    <main className="space-y-8 p-8">
      {/* Header */}

      <div>
        <Link
          href="/products"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to products
        </Link>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{product.name}</h1>

              <span
                className={
                  product.status === "active"
                    ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                    : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                }
              >
                {product.status}
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {product.sku || "No SKU"}
              {product.category ? ` · ${product.category}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Selling price
              <span className="ml-2 font-semibold text-foreground">
                {product.selling_price.toLocaleString()} {business.currency}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/products/${product.id}/edit`}
                className="inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
              >
                Edit
              </Link>

              {product.status === "active" && (
                <DeactivateProductButton productId={product.id} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Net Revenue</p>

          <p className="mt-2 text-2xl font-semibold">
            {profitability.netRevenue.toLocaleString()} {business.currency}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">True Cost / Unit</p>

          <p className="mt-2 text-2xl font-semibold">
            {profitability.trueUnitCost.toFixed(2)} {business.currency}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Contribution</p>

          <p className="mt-2 text-2xl font-semibold">
            {profitability.contribution.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {business.currency}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Contribution Margin</p>

          <p className="mt-2 text-2xl font-semibold">
            {profitability.contributionMargin.toFixed(1)}%
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Target: {product.target_margin}%
          </p>
        </div>
      </section>

      {/* Margin Health */}

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Margin Health</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Understand how this product is performing against its target.
          </p>
        </div>

        <div className="space-y-6 p-5">
          {/* Margin comparison */}

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Actual margin</p>

              <p className="mt-2 text-3xl font-semibold">
                {profitability.contributionMargin.toFixed(1)}%
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Target margin</p>

              <p className="mt-2 text-3xl font-semibold">
                {product.target_margin.toFixed(1)}%
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Margin gap</p>

              <p
                className={`mt-2 text-3xl font-semibold ${
                  profitability.contributionMargin < product.target_margin
                    ? "text-amber-600"
                    : "text-green-600"
                }`}
              >
                {profitability.contributionMargin >= product.target_margin
                  ? "+"
                  : ""}
                {(
                  profitability.contributionMargin - product.target_margin
                ).toFixed(1)}
                pts
              </p>
            </div>
          </div>

          {/* Health status */}

          {profitability.contributionMargin < product.target_margin ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-medium text-amber-900">
                Margin is below target
              </p>

              <p className="mt-1 text-sm text-amber-800">
                This product is currently performing{" "}
                {(
                  product.target_margin - profitability.contributionMargin
                ).toFixed(1)}{" "}
                percentage points below its target.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="font-medium text-green-900">
                Margin is meeting target
              </p>

              <p className="mt-1 text-sm text-green-800">
                This product is currently meeting or exceeding its target
                contribution margin.
              </p>
            </div>
          )}

          {/* Intelligence */}

          {insights.length > 0 && (
            <div className="space-y-6">
              {insights.slice(0, 1).map((insight) => (
                <div key={insight.id} className="space-y-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Primary issue
                    </p>

                    <h3 className="mt-1 text-base font-semibold">
                      {insight.title}
                    </h3>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {insight.why_it_matters && (
                      <div className="rounded-lg border p-4">
                        <p className="text-sm font-medium">Why it matters</p>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {insight.why_it_matters}
                        </p>
                      </div>
                    )}

                    {insight.what_to_investigate && (
                      <div className="rounded-lg border p-4">
                        <p className="text-sm font-medium">
                          What to investigate
                        </p>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {insight.what_to_investigate}
                        </p>
                      </div>
                    )}
                  </div>

                  {insight.financial_impact !== null &&
                    insight.financial_impact !== 0 && (
                      <div className="rounded-lg border p-4">
                        <p className="text-sm font-medium">
                          Estimated financial impact
                        </p>

                        <p className="mt-2 text-xl font-semibold">
                          {Math.abs(insight.financial_impact).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}{" "}
                          {business.currency}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Estimated impact associated with this detected issue.
                        </p>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {insights.length === 0 &&
            profitability.contributionMargin >= product.target_margin && (
              <p className="text-sm text-muted-foreground">
                No active margin issues detected for this product.
              </p>
            )}
        </div>
      </section>

      {/* Cost Breakdown */}

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Cost Breakdown</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Understand what is driving the product&apos;s true cost.
          </p>
        </div>

        <div className="divide-y">
          <div className="flex items-center justify-between p-5">
            <span className="text-sm text-muted-foreground">
              Weighted purchase cost / unit
            </span>

            <span className="font-medium">
              {profitability.weightedAverageUnitCost.toFixed(2)}{" "}
              {business.currency}
            </span>
          </div>

          <div className="flex items-center justify-between p-5">
            <span className="text-sm text-muted-foreground">
              Direct expenses
            </span>

            <span className="font-medium">
              {profitability.directExpenses.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {business.currency}
            </span>
          </div>

          <div className="flex items-center justify-between p-5">
            <span className="text-sm text-muted-foreground">Return costs</span>

            <span className="font-medium">
              {profitability.returnCosts.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {business.currency}
            </span>
          </div>

          <div className="flex items-center justify-between bg-muted/30 p-5">
            <span className="font-medium">True cost / unit</span>

            <span className="font-semibold">
              {profitability.trueUnitCost.toFixed(2)} {business.currency}
            </span>
          </div>
        </div>
      </section>

      {/* Sales Performance */}

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Sales Performance</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Sales volume and revenue after returns.
          </p>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Net units sold</p>

            <p className="mt-2 text-xl font-semibold">
              {profitability.netUnitsSold}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Net revenue</p>

            <p className="mt-2 text-xl font-semibold">
              {profitability.netRevenue.toLocaleString()} {business.currency}
            </p>
          </div>
        </div>
      </section>

      {/* Suppliers */}

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Suppliers</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Suppliers associated with this product.
          </p>
        </div>

        {suppliers.length === 0 ? (
          <div className="p-5">
            <p className="text-sm text-muted-foreground">
              No suppliers have been linked to this product yet.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {suppliers.map(({ id, is_primary, supplier }) => {
              if (!supplier) return null;

              return (
                <div
                  key={id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/suppliers/${supplier.id}`}
                        className="font-medium hover:underline"
                      >
                        {supplier.name}
                      </Link>

                      {is_primary && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Primary
                        </span>
                      )}
                    </div>

                    {supplier.contact_name && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {supplier.contact_name}
                      </p>
                    )}

                    {supplier.email && (
                      <p className="text-sm text-muted-foreground">
                        {supplier.email}
                      </p>
                    )}
                  </div>

                  {supplier.phone && (
                    <p className="text-sm text-muted-foreground">
                      {supplier.phone}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
