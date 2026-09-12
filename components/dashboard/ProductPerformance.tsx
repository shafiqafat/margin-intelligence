import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";

type ProductPerformanceItem = {
  productId: string;
  productName: string;
  sku: string | null;
  netRevenue: number;
  trueUnitCost: number;
  netUnitsSold: number;
  contribution: number;
  contributionMargin: number;
};

type ProductPerformanceProps = {
  products: ProductPerformanceItem[];
  currency: string;
};

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

export function ProductPerformance({
  products,
  currency,
}: ProductPerformanceProps) {
  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  const sortedProducts = [...products].sort(
    (a, b) => b.contribution - a.contribution,
  );

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
            {sortedProducts.map((product) => {
              const marginStatus = getMarginStatus(product.contributionMargin);

              const trueCost = product.trueUnitCost * product.netUnitsSold;

              return (
                <tr
                  key={product.productId}
                  className={`group border-b last:border-0 transition-colors duration-150 hover:bg-primary/[0.035] ${marginStatus.rowClass}`}
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/products/${product.productId}`}
                      className="block"
                    >
                      <p className="text-sm font-semibold transition-colors group-hover:text-primary">
                        {product.productName}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {product.sku ?? "No SKU"}
                      </p>
                    </Link>
                  </td>

                  <td className="px-4 py-3.5 text-right text-sm">
                    {formatMoney(product.netRevenue)}
                  </td>

                  <td className="px-4 py-3.5 text-right text-sm text-muted-foreground">
                    {formatMoney(trueCost)}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <p className="text-sm font-semibold">
                      {formatMoney(product.contribution)}
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
                        {product.contributionMargin.toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                      <span>—</span>
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
