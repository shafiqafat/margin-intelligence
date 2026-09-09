"use client";

import { useActionState } from "react";
import {
  createProduct,
  type CreateProductState,
} from "@/app/(dashboard)/products/actions";

const initialState: CreateProductState = {
  success: false,
  message: "",
};

export function CreateProductForm() {
  const [state, formAction, isPending] = useActionState(
    createProduct,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          Product name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Black T-Shirt"
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
          placeholder="e.g. TS-BLK-001"
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
          placeholder="e.g. Clothing"
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
            placeholder="850"
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
            placeholder="40"
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
        {isPending ? "Creating..." : "Create product"}
      </button>
    </form>
  );
}
