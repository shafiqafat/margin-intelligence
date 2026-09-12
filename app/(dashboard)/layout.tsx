import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { getCurrentBusiness } from "@/lib/services/business";
import { getInsights } from "@/lib/services/insights";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getCurrentBusiness();

  let alertCount = 0;

  if (business) {
    const insights = await getInsights(business.id);

    const activeStatuses = ["new", "viewed", "investigating", "action_taken"];

    alertCount = insights.filter(
      (insight) =>
        insight.severity === "risk" && activeStatuses.includes(insight.status),
    ).length;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar alertCount={alertCount} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}
