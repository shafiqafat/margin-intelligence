"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 text-sm font-semibold">
        {payload[0].value?.toFixed(1)}%
        <span className="ml-1 font-normal text-muted-foreground">margin</span>
      </p>
    </div>
  );
}

type MarginTrendPoint = {
  week: string;
  margin: number;
  revenue: number;
  contribution: number;
};

type MarginTrendChartProps = {
  data: MarginTrendPoint[];
  targetMargin: number;
};

export function MarginTrendChart({
  data,
  targetMargin,
}: MarginTrendChartProps) {
  const currentMargin = data[data.length - 1].margin;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold tracking-tight">Contribution Margin</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Margin performance over the selected period.
          </p>
        </div>

        <div className="flex items-stretch overflow-hidden rounded-lg border bg-muted/20">
          <div className="px-4 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Current
            </p>

            <p className="mt-0.5 text-sm font-semibold">
              {currentMargin.toFixed(1)}%
            </p>
          </div>

          <div className="w-px bg-border" />

          <div className="px-4 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Target
            </p>

            <p className="mt-0.5 text-sm font-semibold">
              {targetMargin.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-3 flex items-center justify-end gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>Margin</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 border-t border-dashed border-primary/50" />
          <span>Target {targetMargin}%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 8,
              right: 8,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="margin-area-gradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity={0.18}
                />

                <stop
                  offset="100%"
                  stopColor="var(--primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 12,
              }}
              dy={8}
            />

            <YAxis
              domain={[0, 50]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 12,
              }}
            />

            <ReferenceLine
              y={targetMargin}
              stroke="var(--primary)"
              strokeOpacity={0.55}
              strokeDasharray="5 4"
              label={{
                value: `Target ${targetMargin}%`,
                position: "insideTopRight",
                fill: "var(--primary)",
                fontSize: 11,
              }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "var(--border)",
                strokeWidth: 1,
              }}
            />

            <Area
              type="monotone"
              dataKey="margin"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#margin-area-gradient)"
              dot={{
                r: 4,
                fill: "var(--card)",
                stroke: "var(--primary)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "var(--primary)",
                stroke: "var(--card)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
