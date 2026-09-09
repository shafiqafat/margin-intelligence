import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MarginTrendChart } from "@/components/dashboard/MarginTrendChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { CostMovement } from "@/components/dashboard/CostMovement";
import { ProductPerformance } from "@/components/dashboard/ProductPerformance";
import { InsightsPreview } from "@/components/dashboard/InsightsPreview";

export default async function DashboardPage() {
  return (
    <div className="relative min-h-full overflow-hidden bg-[#eef4fc]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Large blue atmosphere */}
        <div className="absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-blue-500/[0.085] blur-3xl" />

        {/* Soft center glow */}
        <div className="absolute left-[35%] top-[18%] h-[30rem] w-[30rem] rounded-full bg-indigo-400/[0.045] blur-3xl" />

        {/* Lower blue atmosphere */}
        <div className="absolute -bottom-48 left-[40%] h-[34rem] w-[34rem] rounded-full bg-sky-400/[0.03] blur-3xl" />

        {/* Header wash */}
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-blue-500/[0.045] to-transparent" />
      </div>

      <div className="relative space-y-7 p-5 sm:p-6 lg:p-8">
        <DashboardHeader />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Revenue"
            value="$8,420"
            change="8.4%"
            changeType="positive"
            accent="green"
            data={[62, 68, 66, 75, 82, 91]}
          />

          <StatCard
            title="True Cost"
            value="$5,310"
            change="11.2%"
            changeType="negative"
            accent="red"
            data={[48, 54, 52, 61, 67, 74]}
          />

          <StatCard
            title="Contribution"
            value="$3,110"
            change="2.1%"
            changeType="negative"
            accent="blue"
            data={[68, 65, 67, 64, 61, 59]}
          />

          <StatCard
            title="Contribution Margin"
            value="36.9%"
            change="3.8pp"
            changeType="negative"
            accent="indigo"
            data={[41, 40, 38, 39, 36, 37]}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <MarginTrendChart />
          <CostMovement />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          <ProductPerformance />
          <InsightsPreview />
        </section>
      </div>
    </div>
  );
}
