"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deactivateProduct } from "@/app/(dashboard)/products/actions";

type DeactivateProductButtonProps = {
  productId: string;
};

export function DeactivateProductButton({
  productId,
}: DeactivateProductButtonProps) {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);

  async function handleDeactivate() {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this product? Historical sales and purchase records will remain unchanged.",
    );

    if (!confirmed) {
      return;
    }

    setIsPending(true);

    const result = await deactivateProduct(productId);

    if (!result.success) {
      window.alert(result.message);
      setIsPending(false);
      return;
    }

    router.refresh();
    setIsPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleDeactivate}
      disabled={isPending}
      className="inline-flex h-9 items-center rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Deactivating..." : "Deactivate"}
    </button>
  );
}
