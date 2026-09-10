import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { syncInsights } from "@/lib/services/intelligence";
import { getInsights } from "@/lib/services/insights";
import { InsightStatusActions } from "@/components/insights/InsightStatusActions";

export default async function InsightsPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  await syncInsights(business.id);

  const insights = await getInsights(business.id);

  return (
    <main className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Insights</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Issues and opportunities worth your attention.
        </p>
      </div>

      <section className="space-y-4">
        {insights.map((insight) => {
          const isRisk = insight.severity === "risk";

          return (
            <div
              key={insight.id}
              className="rounded-xl border bg-background p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{insight.title}</h2>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        isRisk
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
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

                {insight.entity_type === "product" && insight.entity_id && (
                  <Link
                    href={`/products/${insight.entity_id}`}
                    className="shrink-0 text-sm font-medium text-primary hover:underline"
                  >
                    View product →
                  </Link>
                )}
              </div>

              <div className="mt-5 border-t pt-5">
                <p className="text-xs text-muted-foreground">
                  Estimated financial impact
                </p>

                <p
                  className={`mt-1 text-xl font-semibold ${
                    insight.financial_impact > 0
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {insight.financial_impact.toLocaleString()}{" "}
                  {business.currency}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t pt-5">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>

                  <p className="mt-1 text-sm font-medium capitalize">
                    {insight.status.replace("_", " ")}
                  </p>
                </div>

                <InsightStatusActions
                  insightId={insight.id}
                  status={insight.status}
                />
              </div>
            </div>
          );
        })}

        {insights.length === 0 && (
          <div className="rounded-xl border bg-background p-10 text-center">
            <h2 className="font-semibold">No significant issues detected</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Your current business data does not contain any significant issues
              requiring attention.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
