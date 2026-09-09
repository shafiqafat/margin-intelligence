import { getCurrentBusiness } from "@/lib/services/business";
import { getProducts } from "@/lib/services/products";
import { getPurchaseItems } from "@/lib/services/purchases";
import { getSaleItems } from "@/lib/services/sales";
import { getReturns } from "@/lib/services/returns";
import { getExpenses } from "@/lib/services/expenses";
import { getCostAllocations } from "@/lib/services/allocations";

import { calculateProductProfitability } from "@/domain/cost/calculateProductProfitability";

export default async function TestProfitabilityPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const [products, purchaseItems, saleItems, returns, expenses, allocations] =
    await Promise.all([
      getProducts(business.id),
      getPurchaseItems(business.id),
      getSaleItems(business.id),
      getReturns(business.id),
      getExpenses(business.id),
      getCostAllocations(business.id),
    ]);

  const results = products.map((product) =>
    calculateProductProfitability({
      product,
      purchaseItems,
      saleItems,
      returns,
      expenses,
      allocations,
    }),
  );

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Product Profitability Test</h1>

      <pre className="mt-4 rounded-lg border bg-muted p-4">
        {JSON.stringify(results, null, 2)}
      </pre>
    </main>
  );
}
