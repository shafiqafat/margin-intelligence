import {
  BarChart3,
  CircleDollarSign,
  Percent,
  WalletCards,
} from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  accent: "green" | "red" | "blue" | "indigo";
  data: number[];
  description?: string;
};

const iconMap = {
  Revenue: BarChart3,
  "True Cost": CircleDollarSign,
  Contribution: WalletCards,
  "Contribution Margin": Percent,
};

const accentStyles = {
  green: {
    border: "border-t-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700",
    chart: "#10b981",
  },
  red: {
    border: "border-t-red-500",
    icon: "bg-red-50 text-red-600",
    badge: "bg-red-50 text-red-700",
    chart: "#ef4444",
  },
  blue: {
    border: "border-t-blue-500",
    icon: "bg-blue-50 text-blue-600",
    badge: "bg-blue-50 text-blue-700",
    chart: "#3b82f6",
  },
  indigo: {
    border: "border-t-indigo-500",
    icon: "bg-indigo-50 text-indigo-600",
    badge: "bg-indigo-50 text-indigo-700",
    chart: "#6366f1",
  },
};

function MiniTrend({
  data,
  color,
  id,
}: {
  data: number[];
  color: string;
  id: string;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 32 - ((value - min) / range) * 25;

      return `${x},${y}`;
    })
    .join(" ");

  const lastY = 32 - ((data[data.length - 1] - min) / range) * 25;

  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="h-12 w-36"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />

          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon points={`0,40 ${points} 100,40`} fill={`url(#gradient-${id})`} />

      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="100" cy={lastY} r="1.8" fill={color} />
    </svg>
  );
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  accent,
  data,
  description,
}: StatCardProps) {
  const Icon = iconMap[title as keyof typeof iconMap];
  const styles = accentStyles[accent];

  const changeStyles =
    changeType === "positive"
      ? "bg-emerald-50 text-emerald-700"
      : changeType === "negative"
        ? "bg-red-50 text-red-700"
        : "bg-muted text-muted-foreground";

  const changeIcon =
    changeType === "positive" ? "↑" : changeType === "negative" ? "↓" : "•";

  const chartId = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-border border-t-2 ${styles.border} bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
    >
      {/* Subtle hover glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary/[0.025] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      {/* Header */}
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
          >
            <Icon className="h-4 w-4" />
          </div>

          <p className="text-sm font-medium text-foreground">{title}</p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${changeStyles}`}
        >
          {changeIcon} {change}
        </span>
      </div>

      {/* Value */}
      <div className="relative mt-3">
        <p className="text-[27px] font-semibold leading-none tracking-tight">
          {value}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          {description ?? "vs previous period"}
        </p>
      </div>

      {/* Mini trend */}
      <div className="pointer-events-none absolute bottom-0 right-0">
        <MiniTrend data={data} color={styles.chart} id={chartId} />
      </div>
    </div>
  );
}
