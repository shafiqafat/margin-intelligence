import Link from "next/link";

const analysisTypes = [
  {
    title: "Costs",
    description:
      "Understand where your money is going and how product costs are changing.",
    details: ["Purchase and direct costs", "Cost movement", "Cost by product"],
    href: "/analysis/costs",
    action: "View Costs",
  },
  {
    title: "Margins",
    description:
      "See which products are meeting their margin targets and where margins are under pressure.",
    details: ["Actual vs target margin", "Margin gaps", "Margin trends"],
    href: "/analysis/margins",
    action: "View Margins",
  },
  {
    title: "Profitability",
    description:
      "Understand which products are contributing the most to your business.",
    details: ["Revenue and true cost", "Contribution", "Product profitability"],
    href: "/analysis/profitability",
    action: "View Profitability",
  },
];

export default function AnalysisPage() {
  return (
    <main className="space-y-6 p-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Analysis
        </p>

        <h1 className="mt-2 text-2xl font-semibold">Analysis</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Understand your costs, margins, and product profitability.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {analysisTypes.map((analysis) => (
          <Link
            key={analysis.href}
            href={analysis.href}
            className="group rounded-xl border bg-background p-6 transition-colors hover:bg-muted/40"
          >
            <h2 className="text-lg font-semibold">{analysis.title}</h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {analysis.description}
            </p>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              {analysis.details.map((detail) => (
                <li key={detail} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 text-sm font-medium text-primary">
              {analysis.action} →
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
