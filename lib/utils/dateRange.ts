import type { DashboardRange } from "@/types/dashboard";

export function getDateRange(range: DashboardRange, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const today = formatter.format(new Date());

  const endDate = new Date(`${today}T00:00:00Z`);

  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - (range - 1));

  const previousEndDate = new Date(startDate);
  previousEndDate.setUTCDate(previousEndDate.getUTCDate() - 1);

  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setUTCDate(previousStartDate.getUTCDate() - (range - 1));

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),

    previousStartDate: previousStartDate.toISOString().slice(0, 10),

    previousEndDate: previousEndDate.toISOString().slice(0, 10),
  };
}
