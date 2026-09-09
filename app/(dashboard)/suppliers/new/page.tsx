import Link from "next/link";

import { CreateSupplierForm } from "@/components/suppliers/CreateSupplierForm";

export default function NewSupplierPage() {
  return (
    <main className="space-y-6 p-8">
      <div>
        <Link
          href="/suppliers"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to suppliers
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Add Supplier</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Add a supplier to track your sourcing relationships.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl border bg-background p-6">
        <CreateSupplierForm />
      </div>
    </main>
  );
}
