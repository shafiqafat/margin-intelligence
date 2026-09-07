import { CalendarDays, ChevronDown } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
          Business overview
        </p>

        <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>

        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
          Understand how your business is performing. Get a clear view of your
          revenue, costs, margins and key insights.
        </p>
      </div>

      <div className="relative shrink-0">
        <select
          defaultValue="30"
          className="h-10 w-full appearance-none rounded-lg border bg-card pl-9 pr-9 text-sm font-medium text-foreground shadow-sm outline-none transition-all hover:border-primary/30 hover:shadow focus:border-primary/40 focus:ring-2 focus:ring-primary/10 sm:w-36"
          aria-label="Select dashboard time period"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>

        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}
