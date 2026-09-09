"use client";

import { useActionState } from "react";

import {
  updateSupplier,
  type CreateSupplierState,
} from "@/app/(dashboard)/suppliers/actions";

type Supplier = {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

type EditSupplierFormProps = {
  supplier: Supplier;
};

const initialState: CreateSupplierState = {
  success: false,
  message: "",
};

export function EditSupplierForm({ supplier }: EditSupplierFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateSupplier,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="supplierId" value={supplier.id} />

      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          Supplier name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          defaultValue={supplier.name}
          required
          className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        />

        {state.errors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="contactName" className="mb-2 block text-sm font-medium">
          Contact person
        </label>

        <input
          id="contactName"
          name="contactName"
          type="text"
          defaultValue={supplier.contact_name ?? ""}
          className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        />

        {state.errors?.contactName && (
          <p className="mt-1 text-xs text-red-600">
            {state.errors.contactName[0]}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            defaultValue={supplier.email ?? ""}
            className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />

          {state.errors?.email && (
            <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">
            Phone
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={supplier.phone ?? ""}
            className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />

          {state.errors?.phone && (
            <p className="mt-1 text-xs text-red-600">{state.errors.phone[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-2 block text-sm font-medium">
          Notes
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={supplier.notes ?? ""}
          className="w-full resize-none rounded-lg border bg-background px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        />

        {state.errors?.notes && (
          <p className="mt-1 text-xs text-red-600">{state.errors.notes[0]}</p>
        )}
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
