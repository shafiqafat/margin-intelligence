import Link from "next/link";

import { EditSupplierForm } from "@/components/suppliers/EditSupplierForm";
import { getCurrentBusiness } from "@/lib/services/business";
import { getSupplierById } from "@/lib/services/suppliers";

export default async function EditSupplierPage({
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

  const supplier = await getSupplierById(business.id, id);

  if (!supplier) {
    return (
      <main className="p-8">
        <Link
          href="/suppliers"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to suppliers
        </Link>

        <h1 className="mt-6 text-2xl font-semibold">Supplier not found</h1>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-8">
      <div>
        <Link
          href={`/suppliers/${supplier.id}`}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to supplier
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Edit Supplier</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the information for {supplier.name}.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl border bg-background p-6">
        <EditSupplierForm supplier={supplier} />
      </div>
    </main>
  );
}
