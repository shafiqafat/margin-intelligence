import { getCurrentBusiness } from "@/lib/services/business";
import { getGeneratedInsights } from "@/lib/services/intelligence";

export default async function TestIntelligencePage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const insights = await getGeneratedInsights(business.id);

  return (
    <main className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Intelligence Engine Test</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Generated findings from current business data.
        </p>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={`${insight.productId}-${index}`}
            className="rounded-xl border bg-background p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{insight.title}</h2>

              <span className="text-xs font-medium uppercase">
                {insight.severity}
              </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {insight.description}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                {"marginGap" in insight &&
                  typeof insight.marginGap === "number" && (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Margin Gap
                      </p>

                      <p className="mt-1 font-semibold">
                        {insight.marginGap.toFixed(1)} points
                      </p>
                    </>
                  )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Estimated Impact
                </p>

                <p className="mt-1 font-semibold">
                  {insight.financialImpact.toLocaleString()} {business.currency}
                </p>
              </div>
            </div>
            {insight.explanation && (
              <div className="mt-6 border-t pt-5">
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      What happened
                    </p>

                    <p className="mt-1 text-sm">
                      {insight.explanation.whatHappened}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Why it matters
                    </p>

                    <p className="mt-1 text-sm">
                      {insight.explanation.whyItMatters}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      What to investigate
                    </p>

                    <p className="mt-1 text-sm">
                      {insight.explanation.whatToInvestigate}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {insights.length === 0 && (
          <div className="rounded-xl border bg-background p-8 text-center">
            <p className="font-medium">No significant issues detected.</p>
          </div>
        )}
      </div>
    </main>
  );
}
