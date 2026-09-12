import Link from "next/link";

import { ReturnForm } from "@/components/returns/ReturnForm";
import { getCurrentBusiness } from "@/lib/services/business";
import { getSalesForReturn } from "@/lib/services/sales";
import { getReturns } from "@/lib/services/returns";

export default async function NewReturnPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return null;
  }

  const [sales, returns] = await Promise.all([
    getSalesForReturn(business.id),
    getReturns(business.id),
  ]);

  return (
    <main className="space-y-6 p-8">
      <div>
        <Link
          href="/transactions/sales"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Sales
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold">Record Return</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Record a product return against an existing sale.
          </p>
        </div>
      </div>

      <ReturnForm businessId={business.id} sales={sales} returns={returns} />
    </main>
  );
}
