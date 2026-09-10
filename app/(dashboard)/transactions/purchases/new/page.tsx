import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getProducts } from "@/lib/services/products";
import { getSuppliers } from "@/lib/services/suppliers";

import { CreatePurchaseForm } from "@/components/purchases/CreatePurchaseForm";

export default async function NewPurchasePage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const [products, suppliers] = await Promise.all([
    getProducts(business.id),
    getSuppliers(business.id),
  ]);

  return (
    <main className="space-y-6 p-8">
      <div>
        <Link
          href="/transactions/purchases"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to purchases
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Record Purchase</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Record products purchased from a supplier.
        </p>
      </div>

      <div className="max-w-5xl rounded-xl border bg-background p-6">
        <CreatePurchaseForm suppliers={suppliers} products={products} />
      </div>
    </main>
  );
}
