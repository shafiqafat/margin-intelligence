import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Boxes } from "lucide-react";

const products = [
  {
    name: "Canvas Bag",
    sku: "CB-001",
    revenue: 1850,
    trueCost: 948,
    contribution: 902,
    margin: 48.8,
    change: 2.1,
    trend: "up",
  },
  {
    name: "Black T-Shirt",
    sku: "BT-002",
    revenue: 2340,
    trueCost: 1435,
    contribution: 905,
    margin: 38.7,
    change: -4.5,
    trend: "down",
  },
  {
    name: "Classic Dress",
    sku: "CD-003",
    revenue: 1620,
    trueCost: 1050,
    contribution: 570,
    margin: 35.2,
    change: 1.4,
    trend: "up",
  },
  {
    name: "Premium Hoodie",
    sku: "PH-004",
    revenue: 1820,
    trueCost: 1430,
    contribution: 390,
    margin: 21.4,
    change: -8.2,
    trend: "down",
  },
  {
    name: "Classic Watch",
    sku: "CW-005",
    revenue: 790,
    trueCost: 666,
    contribution: 124,
    margin: 15.7,
    change: -6.1,
    trend: "down",
  },
];

function getMarginStatus(margin: number) {
  if (margin >= 40) {
    return {
      label: "Healthy",
      className: "bg-emerald-50 text-emerald-700",
      rowClass: "",
    };
  }

  if (margin >= 25) {
    return {
      label: "Watch",
      className: "bg-amber-50 text-amber-700",
      rowClass: "bg-amber-500/[0.015]",
    };
  }

  return {
    label: "Low margin",
    className: "bg-red-50 text-red-700",
    rowClass: "bg-red-500/[0.02]",
  };
}

export function ProductPerformance() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-blue-50/70 via-white to-transparent px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Boxes className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-semibold tracking-tight">
                Product Performance
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Products ranked by contribution. See which products are driving
                your profitability.
              </p>
            </div>
          </div>

          <Link
            href="/products"
            className="group flex shrink-0 items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/25 hover:text-primary hover:shadow"
          >
            View all products
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-muted/30">
            <tr className="border-b">
              <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Product
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Revenue
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                True Cost
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Contribution
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Margin
              </th>

              <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Change
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const marginStatus = getMarginStatus(product.margin);
              const isPositive = product.trend === "up";

              return (
                
                <tr
                  key={product.sku}
                  className={`group border-b last:border-0 transition-colors duration-150 hover:bg-primary/[0.035] ${marginStatus.rowClass}`}
                >
                  
                  <td className="px-5 py-3.5">
                    <Link href={`/products/${product.sku}`} className="block">
                      <p className="text-sm font-semibold transition-colors group-hover:text-primary">
                        {product.name}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {product.sku}
                      </p>
                    </Link>
                  </td>

                  <td className="px-4 py-3.5 text-right text-sm">
                    ${product.revenue.toLocaleString()}
                  </td>

                  <td className="px-4 py-3.5 text-right text-sm text-muted-foreground">
                    ${product.trueCost.toLocaleString()}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <p className="text-sm font-semibold">
                      ${product.contribution.toLocaleString()}
                    </p>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${marginStatus.className}`}
                      >
                        {marginStatus.label}
                      </span>

                      <span className="text-sm font-semibold">
                        {product.margin.toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div
                      className={`inline-flex items-center gap-1 text-sm font-semibold ${
                        isPositive ? "text-emerald-600" : "text-destructive"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      {Math.abs(product.change).toFixed(1)}pp
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
