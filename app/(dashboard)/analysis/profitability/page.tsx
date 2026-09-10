import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getProfitabilityAnalysis } from "@/lib/services/profitabilityAnalysis";

export default async function ProfitabilityAnalysisPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const analysis = await getProfitabilityAnalysis(business.id);

  return (
    <main className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Profitability Analysis</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          See which products are contributing the most to your business.
        </p>
      </div>

      {/* KPI Cards */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Total Revenue</p>

          <p className="mt-2 text-2xl font-semibold">
            {analysis.totals.totalRevenue.toLocaleString()} {business.currency}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Total Contribution</p>

          <p className="mt-2 text-2xl font-semibold">
            {analysis.totals.totalContribution.toLocaleString()}{" "}
            {business.currency}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Profitable Products</p>

          <p className="mt-2 text-2xl font-semibold">
            {analysis.totals.profitableProducts}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Loss-Making Products</p>

          <p className="mt-2 text-2xl font-semibold">
            {analysis.totals.lossMakingProducts}
          </p>
        </div>
      </section>

      {/* Key Products */}

      <section className="grid gap-4 lg:grid-cols-2">
        {analysis.mostProfitableProduct && (
          <div className="rounded-xl border bg-background p-6">
            <p className="text-sm text-muted-foreground">
              Most Profitable Product
            </p>

            <Link
              href={`/products/${analysis.mostProfitableProduct.productId}`}
              className="mt-2 block text-xl font-semibold hover:underline"
            >
              {analysis.mostProfitableProduct.productName}
            </Link>

            <p className="mt-2 text-sm text-muted-foreground">Contribution</p>

            <p className="mt-1 text-2xl font-semibold">
              {analysis.mostProfitableProduct.contribution.toLocaleString()}{" "}
              {business.currency}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {analysis.mostProfitableProduct.contributionMargin.toFixed(1)}%
              contribution margin
            </p>
          </div>
        )}

        {analysis.biggestLossProduct && (
          <div className="rounded-xl border bg-background p-6">
            <p className="text-sm text-muted-foreground">Biggest Loss</p>

            <Link
              href={`/products/${analysis.biggestLossProduct.productId}`}
              className="mt-2 block text-xl font-semibold hover:underline"
            >
              {analysis.biggestLossProduct.productName}
            </Link>

            <p className="mt-2 text-sm text-muted-foreground">Contribution</p>

            <p className="mt-1 text-2xl font-semibold">
              {analysis.biggestLossProduct.contribution.toLocaleString()}{" "}
              {business.currency}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {analysis.biggestLossProduct.contributionMargin.toFixed(1)}%
              contribution margin
            </p>
          </div>
        )}
      </section>

      {/* Ranking */}

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Profitability Ranking</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Products ranked by contribution.
          </p>
        </div>

        <div className="divide-y">
          {analysis.products.map((product, index) => {
            const isLossMaking = product.contribution < 0;

            return (
              <div
                key={product.productId}
                className="grid gap-4 p-5 sm:grid-cols-5"
              >
                <div>
                  <p className="text-xs text-muted-foreground">#{index + 1}</p>

                  <Link
                    href={`/products/${product.productId}`}
                    className="font-medium hover:underline"
                  >
                    {product.productName}
                  </Link>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>

                  <p className="mt-1 font-medium">
                    {product.netRevenue.toLocaleString()} {business.currency}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Contribution</p>

                  <p
                    className={`mt-1 font-medium ${
                      isLossMaking ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {product.contribution.toLocaleString()} {business.currency}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Margin</p>

                  <p className="mt-1 font-medium">
                    {product.contributionMargin.toFixed(1)}%
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Status</p>

                  <p
                    className={`mt-1 font-medium ${
                      isLossMaking ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {isLossMaking ? "Loss-making" : "Profitable"}
                  </p>
                </div>
              </div>
            );
          })}

          {analysis.products.length === 0 && (
            <div className="p-8 text-center">
              <p className="font-medium">No sales data yet</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Profitability will appear once products have sales.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
