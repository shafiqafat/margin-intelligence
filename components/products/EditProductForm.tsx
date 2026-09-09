"use client";

import { useActionState } from "react";

import {
  updateProduct,
  type CreateProductState,
} from "@/app/(dashboard)/products/actions";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  selling_price: number;
  target_margin: number;
};

type EditProductFormProps = {
  product: Product;
};

const initialState: CreateProductState = {
  success: false,
  message: "",
};

export function EditProductForm({ product }: EditProductFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProduct,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="productId" value={product.id} />

      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          Product name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          defaultValue={product.name}
          required
          className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        />

        {state.errors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="sku" className="mb-2 block text-sm font-medium">
          SKU
        </label>

        <input
          id="sku"
          name="sku"
          type="text"
          defaultValue={product.sku ?? ""}
          className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        />

        {state.errors?.sku && (
          <p className="mt-1 text-xs text-red-600">{state.errors.sku[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="mb-2 block text-sm font-medium">
          Category
        </label>

        <input
          id="category"
          name="category"
          type="text"
          defaultValue={product.category ?? ""}
          className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        />

        {state.errors?.category && (
          <p className="mt-1 text-xs text-red-600">
            {state.errors.category[0]}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="sellingPrice"
            className="mb-2 block text-sm font-medium"
          >
            Selling price
          </label>

          <input
            id="sellingPrice"
            name="sellingPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product.selling_price}
            required
            className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />

          {state.errors?.sellingPrice && (
            <p className="mt-1 text-xs text-red-600">
              {state.errors.sellingPrice[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="targetMargin"
            className="mb-2 block text-sm font-medium"
          >
            Target margin (%)
          </label>

          <input
            id="targetMargin"
            name="targetMargin"
            type="number"
            min="0"
            max="100"
            step="0.1"
            defaultValue={product.target_margin}
            required
            className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />

          {state.errors?.targetMargin && (
            <p className="mt-1 text-xs text-red-600">
              {state.errors.targetMargin[0]}
            </p>
          )}
        </div>
      </div>

      {state.message && (
        <div
          className={
            state.success
              ? "rounded-lg border border-green-200 bg-green-50 px-3.5 py-3 text-sm text-green-700"
              : "rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
          }
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
