import Link from "next/link";
import { CreateProductForm } from "@/components/products/CreateProductForm";

export default function NewProductPage() {
  return (
    <main className="space-y-6 p-8">
      <div>
        <Link
          href="/products"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to products
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Add Product</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Add a product to start tracking its costs and margins.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl border bg-background p-6">
        <CreateProductForm />
      </div>
    </main>
  );
}
