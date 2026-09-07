import Link from "next/link";
import {
  ArrowRight,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

const insights = [
  {
    type: "risk",
    title: "Premium Hoodie margin dropped 8.2pp",
    description: "Supplier costs increased across the last three purchases.",
    impact: "-$210/month",
    action: "Review supplier pricing",
    icon: TrendingDown,
  },
  {
    type: "warning",
    title: "Supplier A pricing increased 14%",
    description:
      "Average purchase cost is significantly higher than previous purchases.",
    impact: "-$145/month",
    action: "Compare supplier prices",
    icon: AlertTriangle,
  },
  {
    type: "opportunity",
    title: "Canvas Bag supplier opportunity",
    description: "Supplier B currently offers a lower average purchase cost.",
    impact: "+$96/month",
    action: "Review supplier",
    icon: Lightbulb,
  },
];

function getInsightStyles(type: string) {
  if (type === "risk") {
    return {
      wrapper: "bg-red-50/70 hover:bg-red-50",
      icon: "bg-red-100 text-red-600",
      badge: "bg-red-100 text-red-700",
      impact: "text-red-600",
      accent: "bg-red-500",
    };
  }

  if (type === "warning") {
    return {
      wrapper: "bg-amber-50/70 hover:bg-amber-50",
      icon: "bg-amber-100 text-amber-600",
      badge: "bg-amber-100 text-amber-700",
      impact: "text-red-600",
      accent: "bg-amber-500",
    };
  }

  return {
    wrapper: "bg-emerald-50/70 hover:bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    impact: "text-emerald-600",
    accent: "bg-emerald-500",
  };
}

export function InsightsPreview() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-amber-50/50 via-white to-transparent px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Lightbulb className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-semibold tracking-tight">Insights</h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Issues and opportunities worth your attention.
              </p>
            </div>
          </div>

          <Link
            href="/insights"
            className="group flex shrink-0 items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/25 hover:text-primary hover:shadow"
          >
            View all insights
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Insights */}
      <div className="flex flex-1 flex-col gap-3 p-3">
        {insights.map((insight) => {
          const Icon = insight.icon;
          const styles = getInsightStyles(insight.type);

          return (
            <div
              key={insight.title}
              className={`group relative flex flex-1 overflow-hidden rounded-lg border p-4 transition-colors ${styles.wrapper}`}
            >
              {/* Semantic accent */}
              <div
                className={`absolute inset-y-0 left-0 w-1 ${styles.accent}`}
              />

              <div className="flex min-w-0 flex-1 gap-3">
                {/* Icon */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{insight.title}</p>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles.badge}`}
                    >
                      {insight.type === "risk"
                        ? "Risk"
                        : insight.type === "warning"
                          ? "Warning"
                          : "Opportunity"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {insight.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-2">
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                        Estimated impact
                      </p>

                      <p
                        className={`mt-0.5 text-sm font-semibold ${styles.impact}`}
                      >
                        {insight.impact}
                      </p>
                    </div>

                    <div className="hidden h-8 w-px bg-border sm:block" />

                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                        Suggested action
                      </p>

                      <p className="mt-0.5 text-sm font-medium text-primary">
                        {insight.action}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
