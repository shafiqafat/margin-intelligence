import { getCurrentBusiness } from "@/lib/services/business";
import { getMarginAnalysis } from "@/lib/services/margins";

export default async function MarginsAnalysisPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const analysis = await getMarginAnalysis(business.id);

  return (
    <main className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Margin Analysis</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Understand which products are generating healthy margins.
        </p>
      </div>

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
          <p className="text-sm text-muted-foreground">Overall Margin</p>

          <p className="mt-2 text-2xl font-semibold">
            {analysis.totals.overallMargin.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Below Target</p>

          <p className="mt-2 text-2xl font-semibold">
            {analysis.totals.belowTarget}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Products below target margin
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Product Margin Comparison</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Compare actual contribution margins against target margins.
          </p>
        </div>

        <div className="divide-y">
          {analysis.products.map((product) => {
            const isBelowTarget =
              product.contributionMargin < product.targetMargin;

            return (
              <div
                key={product.productId}
                className="grid gap-4 p-5 sm:grid-cols-5"
              >
                <div>
                  <p className="font-medium">{product.productName}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>

                  <p className="mt-1 font-medium">
                    {product.netRevenue.toLocaleString()} {business.currency}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Contribution</p>

                  <p className="mt-1 font-medium">
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
                  <p className="text-xs text-muted-foreground">Target</p>

                  <p
                    className={`mt-1 font-medium ${
                      isBelowTarget ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {product.targetMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
