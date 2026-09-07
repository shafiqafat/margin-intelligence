import {
  ArrowUpRight,
  CircleDollarSign,
  Package,
  RotateCcw,
  Truck,
  CreditCard,
} from "lucide-react";

const costMovements = [
  {
    name: "Purchase costs",
    amount: 420,
    description: "Supplier prices increased",
    percentage: 52.6,
    icon: CircleDollarSign,
  },
  {
    name: "Delivery",
    amount: 180,
    description: "Higher delivery costs",
    percentage: 22.6,
    icon: Truck,
  },
  {
    name: "Returns",
    amount: 95,
    description: "Return-related costs",
    percentage: 11.9,
    icon: RotateCcw,
  },
  {
    name: "Payment fees",
    amount: 72,
    description: "More payment processing fees",
    percentage: 9,
    icon: CreditCard,
  },
  {
    name: "Packaging",
    amount: 31,
    description: "Packaging costs increased",
    percentage: 3.9,
    icon: Package,
  },
];

export function CostMovement() {
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
        {costMovements.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.name} className="group">
              {/* Top row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />

                  <p className="truncate text-sm font-medium">{item.name}</p>
                </div>

                <p className="shrink-0 text-sm font-semibold">
                  +${item.amount}
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
                  {item.percentage}% of increase
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
