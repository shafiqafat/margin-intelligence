import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MarginTrendChart } from "@/components/dashboard/MarginTrendChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { CostMovement } from "@/components/dashboard/CostMovement";
import { ProductPerformance } from "@/components/dashboard/ProductPerformance";
import { InsightsPreview } from "@/components/dashboard/InsightsPreview";
import { getCurrentBusiness } from "@/lib/services/business";
import { getDashboardData } from "@/lib/services/dashboard";
import { getInsights } from "@/lib/services/insights";
import { syncInsights } from "@/lib/services/intelligence";
import { getCostMovement } from "@/lib/services/costMovement";
import { getMarginTrend } from "@/lib/services/marginTrend";

import type { DashboardRange } from "@/types/dashboard";

type DashboardPageProps = {
  searchParams: Promise<{
    range?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const business = await getCurrentBusiness();
  if (!business) {
    return null;
  }
  const params = await searchParams;

  const allowedRanges: DashboardRange[] = [7, 30, 90];

  const parsedRange = Number(params.range);

  const range: DashboardRange = allowedRanges.includes(
    parsedRange as DashboardRange,
  )
    ? (parsedRange as DashboardRange)
    : 30;

  await syncInsights(business.id);

  const [dashboard, insights, costMovement, marginTrend] = await Promise.all([
    getDashboardData(business.id, range, business.timezone),
    getInsights(business.id),
    getCostMovement(business.id, range, business.timezone),
    getMarginTrend(business.id, range, business.timezone),
  ]);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: business.currency,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#eef4fc]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_55%)]" />

      <div className="relative space-y-6">
        <DashboardHeader />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Revenue"
            value={formatMoney(dashboard.revenue)}
            change="Current"
            changeType="neutral"
            accent="blue"
            data={[dashboard.revenue, dashboard.revenue]}
            description="Net revenue"
          />

          <StatCard
            title="True Cost"
            value={formatMoney(dashboard.trueCost)}
            change="Current"
            changeType="neutral"
            accent="red"
            data={[dashboard.trueCost, dashboard.trueCost]}
            description="Product-level true cost"
          />

          <StatCard
            title="Contribution"
            value={formatMoney(dashboard.contribution)}
            change="Current"
            changeType="neutral"
            accent="green"
            data={[dashboard.contribution, dashboard.contribution]}
            description="Revenue minus direct costs"
          />

          <StatCard
            title="Contribution Margin"
            value={`${dashboard.contributionMargin.toFixed(1)}%`}
            change="Current"
            changeType="neutral"
            accent="indigo"
            data={[dashboard.contributionMargin, dashboard.contributionMargin]}
            description="Contribution as % of revenue"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <MarginTrendChart
            data={marginTrend.weeks}
            targetMargin={marginTrend.targetMargin}
          />
          <CostMovement
            movements={costMovement.movements}
            currency={business.currency}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <ProductPerformance
            products={dashboard.products}
            currency={business.currency}
          />
          <InsightsPreview insights={insights} currency={business.currency} />
        </section>
      </div>
    </div>
  );
}
