import { getCurrentBusiness } from "@/lib/services/business";
import { getCostAnalysis } from "@/lib/services/cost";

export default async function CostsAnalysisPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const analysis = await getCostAnalysis(business.id);

  return (
    <main className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Cost Analysis</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Understand what is driving your product costs.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Purchase Cost</p>

          <p className="mt-2 text-2xl font-semibold">
            {analysis.totals.purchaseCost.toLocaleString()} {business.currency}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Direct Costs</p>

          <p className="mt-2 text-2xl font-semibold">
            {analysis.totals.directCosts.toLocaleString()} {business.currency}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Total True Cost</p>

          <p className="mt-2 text-2xl font-semibold">
            {analysis.totals.trueCost.toLocaleString()} {business.currency}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Average True Cost / Unit
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {analysis.totals.averageTrueCost.toFixed(2)} {business.currency}
          </p>
        </div>
        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Return Costs</p>

          <p className="mt-2 text-2xl font-semibold">
            {analysis.totals.returnCosts.toLocaleString()} {business.currency}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Shipping + restocking
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-background p-6">
        <div>
          <h2 className="font-semibold">Cost Composition</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            See what makes up your total true cost.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {(() => {
            const totalTrueCost = analysis.totals.trueCost;

            const purchasePercentage =
              totalTrueCost > 0
                ? (analysis.totals.purchaseCost / totalTrueCost) * 100
                : 0;

            const directCostPercentage =
              totalTrueCost > 0
                ? (analysis.totals.directCosts / totalTrueCost) * 100
                : 0;

            return (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Purchase Cost</p>

                      <p className="text-xs text-muted-foreground">
                        Product acquisition cost
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {analysis.totals.purchaseCost.toLocaleString()}{" "}
                        {business.currency}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {purchasePercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${purchasePercentage}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Direct Costs</p>

                      <p className="text-xs text-muted-foreground">
                        Shipping and other allocated product costs
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {analysis.totals.directCosts.toLocaleString()}{" "}
                        {business.currency}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {directCostPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${directCostPercentage}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      <section className="rounded-xl border bg-background p-6">
        <div>
          <h2 className="font-semibold">Return Leakage</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Costs created by returned products.
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Return Costs</p>

            <p className="mt-2 text-2xl font-semibold">
              {analysis.totals.returnCosts.toLocaleString()} {business.currency}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Shipping + restocking
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Refunded Revenue</p>

            <p className="mt-2 text-2xl font-semibold">
              {analysis.totals.refundedRevenue.toLocaleString()}{" "}
              {business.currency}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Revenue reversed through returns
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <h2 className="font-semibold">Product Cost Comparison</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Compare purchase cost and true cost across products.
          </p>
        </div>

        <div className="divide-y">
          {analysis.products.map((product) => (
            <div key={product.id} className="grid gap-4 p-5 sm:grid-cols-5">
              <div>
                <p className="font-medium">{product.name}</p>

                <p className="text-xs text-muted-foreground">
                  {product.sku || "No SKU"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Purchase Cost</p>

                <p className="mt-1 font-medium">
                  {product.purchaseCost.toLocaleString()} {business.currency}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Direct Costs</p>

                <p className="mt-1 font-medium">
                  {product.allocatedDirectCosts.toLocaleString()}{" "}
                  {business.currency}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Return Costs</p>

                <p className="mt-1 font-medium">
                  {product.returnCosts.toLocaleString()} {business.currency}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  True Cost / Unit
                </p>

                <p className="mt-1 font-medium">
                  {product.trueCostPerUnit.toFixed(2)} {business.currency}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
