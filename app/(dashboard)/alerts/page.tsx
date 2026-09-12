import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { syncInsights } from "@/lib/services/intelligence";
import { getInsights } from "@/lib/services/insights";
import { InsightStatusActions } from "@/components/insights/InsightStatusActions";

export default async function AlertsPage() {
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

  const alerts = insights.filter(
    (insight) => insight.severity === "risk" && insight.status !== "resolved",
  );

  return (
    <main className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Alerts</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          High-priority issues that may require immediate attention.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-xl border bg-background p-10 text-center">
          <h2 className="font-semibold">No active alerts</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your business currently has no high-priority issues requiring
            attention.
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-red-200 bg-red-50/30 p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                      Risk
                    </span>

                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {alert.status.replace("_", " ")}
                    </span>
                  </div>

                  <h2 className="mt-3 font-semibold">{alert.title}</h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {alert.description}
                  </p>
                </div>

                {alert.entity_type === "product" && alert.entity_id && (
                  <Link
                    href={`/products/${alert.entity_id}`}
                    className="shrink-0 text-sm font-medium text-primary hover:underline"
                  >
                    View product →
                  </Link>
                )}
              </div>

              <div className="mt-5 border-t border-red-200 pt-5">
                <p className="text-xs text-muted-foreground">
                  Estimated financial impact
                </p>

                <p className="mt-1 text-xl font-semibold text-red-600">
                  {alert.financial_impact.toLocaleString()} {business.currency}
                </p>
              </div>

              {(alert.what_happened ||
                alert.why_it_matters ||
                alert.what_to_investigate) && (
                <div className="mt-5 border-t border-red-200 pt-5">
                  <div className="grid gap-6 md:grid-cols-3">
                    {alert.what_happened && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          What happened
                        </p>

                        <p className="mt-1 text-sm leading-6">
                          {alert.what_happened}
                        </p>
                      </div>
                    )}

                    {alert.why_it_matters && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Why it matters
                        </p>

                        <p className="mt-1 text-sm leading-6">
                          {alert.why_it_matters}
                        </p>
                      </div>
                    )}

                    {alert.what_to_investigate && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          What to investigate
                        </p>

                        <p className="mt-1 text-sm leading-6">
                          {alert.what_to_investigate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-4 border-t border-red-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>

                  <p className="mt-1 text-sm font-medium capitalize">
                    {alert.status.replace("_", " ")}
                  </p>
                </div>

                <InsightStatusActions
                  insightId={alert.id}
                  status={alert.status}
                />
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
