import {
  ArrowUpRight,
  CircleDollarSign,
  Package,
  RotateCcw,
  Truck,
  CreditCard,
} from "lucide-react";

type CostMovementItem = {
  name: string;
  category:
    | "purchase_costs"
    | "delivery"
    | "returns"
    | "payment_fees"
    | "packaging";
  amount: number;
  description: string;
  percentage: number;
};

type CostMovementProps = {
  movements: CostMovementItem[];
  currency: string;
};
const iconMap = {
  purchase_costs: CircleDollarSign,
  delivery: Truck,
  returns: RotateCcw,
  payment_fees: CreditCard,
  packaging: Package,
};

export function CostMovement({ movements, currency }: CostMovementProps) {
  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ArrowUpRight className="h-4 w-4" />
          </div>

          <div>
            <h2 className="font-semibold tracking-tight">Cost Movement</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              What is driving changes in your direct costs?
            </p>
          </div>
        </div>
      </div>

      {/* Cost items */}
      <div className="space-y-5">
        {movements.map((item) => {
          const Icon = iconMap[item.category];

          return (
            <div key={item.name} className="group">
              {/* Top row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />

                  <p className="truncate text-sm font-medium">{item.name}</p>
                </div>

                <p
                  className={`shrink-0 text-sm font-semibold ${
                    item.amount >= 0 ? "text-foreground" : "text-emerald-600"
                  }`}
                >
                  {item.amount >= 0 ? "+" : "-"}
                  {formatMoney(item.amount)}
                </p>
              </div>

              {/* Description */}
              <p className="mt-0.5 pl-5.5 text-xs text-muted-foreground">
                {item.description}
              </p>

              {/* Progress */}
              <div className="mt-2.5 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300 group-hover:bg-primary/80"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>

                <span className="w-20 shrink-0 text-right text-[10px] font-medium text-muted-foreground">
                  {item.amount > 0
                    ? `${item.percentage.toFixed(1)}% of increase`
                    : "Cost decreased"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
