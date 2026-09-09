import Link from "next/link";

import { getCurrentBusiness } from "@/lib/services/business";
import { getProductById } from "@/lib/services/products";
import { EditProductForm } from "@/components/products/EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">No business found</h1>
      </main>
    );
  }

  const product = await getProductById(business.id, id);

  if (!product) {
    return (
      <main className="p-8">
        <Link
          href="/products"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to products
        </Link>

        <h1 className="mt-6 text-2xl font-semibold">Product not found</h1>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-8">
      <div>
        <Link
          href={`/products/${product.id}`}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to product
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Edit Product</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the information for {product.name}.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl border bg-background p-6">
        <EditProductForm product={product} />
      </div>
    </main>
  );
}
