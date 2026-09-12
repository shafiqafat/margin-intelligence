import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getProducts } from "@/lib/services/products";

import { SaleForm } from "@/components/sales/SaleForm";

export default async function NewSalePage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return null;
  }

  const products = await getProducts(business.id);

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
          <h1 className="text-2xl font-semibold">Create Sale</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Record a completed product sale and its selling costs.
          </p>
        </div>
      </div>

      <SaleForm businessId={business.id} products={products} />
    </main>
  );
}
