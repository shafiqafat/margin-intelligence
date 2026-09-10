"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

import {
  createPurchase,
  type CreatePurchaseState,
} from "@/app/(dashboard)/transactions/purchases/actions";

type Supplier = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  sku: string | null;
};

type PurchaseItem = {
  productId: string;
  quantity: number;
  unitCost: number;
};

type CreatePurchaseFormProps = {
  suppliers: Supplier[];
  products: Product[];
};

const initialState: CreatePurchaseState = {
  success: false,
  message: "",
};

export function CreatePurchaseForm({
  suppliers,
  products,
}: CreatePurchaseFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    createPurchase,
    initialState,
  );

  const [supplierId, setSupplierId] = useState("");

  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [reference, setReference] = useState("");

  const [shippingCost, setShippingCost] = useState(0);

  const [additionalCost, setAdditionalCost] = useState(0);

  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<PurchaseItem[]>([
    {
      productId: "",
      quantity: 1,
      unitCost: 0,
    },
  ]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.quantity * item.unitCost,
      0,
    );
  }, [items]);

  const totalCost = subtotal + shippingCost + additionalCost;

  function updateItem(index: number, field: keyof PurchaseItem, value: string) {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (field === "productId") {
          return {
            ...item,
            productId: value,
          };
        }

        return {
          ...item,
          [field]: Number(value),
        };
      }),
    );
  }

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      {
        productId: "",
        quantity: 1,
        unitCost: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();

    formData.set("supplierId", supplierId);
    formData.set("purchaseDate", purchaseDate);
    formData.set("reference", reference);
    formData.set("shippingCost", String(shippingCost));
    formData.set("additionalCost", String(additionalCost));
    formData.set("notes", notes);
    formData.set("items", JSON.stringify(items));

    formAction(formData);
  }

  if (state.success) {
    router.push("/transactions/purchases");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Purchase Information */}

      <section className="space-y-5">
        <div>
          <h2 className="font-semibold">Purchase Information</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Record the supplier and purchase details.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="supplierId"
              className="mb-2 block text-sm font-medium"
            >
              Supplier
            </label>

            <select
              id="supplierId"
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              required
              className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="">Select supplier</option>

              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="purchaseDate"
              className="mb-2 block text-sm font-medium"
            >
              Purchase date
            </label>

            <input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
              required
              className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="reference"
              className="mb-2 block text-sm font-medium"
            >
              Reference
            </label>

            <input
              id="reference"
              type="text"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="e.g. PO-1004"
              className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>
      </section>

      {/* Items */}

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Purchase Items</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add the products and their purchase costs.
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted"
          >
            + Add item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-xl border p-4 sm:grid-cols-[2fr_1fr_1fr_auto]"
            >
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Product
                </label>

                <select
                  value={item.productId}
                  onChange={(event) =>
                    updateItem(index, "productId", event.target.value)
                  }
                  required
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">Select product</option>

                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                      {product.sku ? ` · ${product.sku}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Quantity
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(index, "quantity", event.target.value)
                  }
                  required
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Unit cost
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitCost}
                  onChange={(event) =>
                    updateItem(index, "unitCost", event.target.value)
                  }
                  required
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="h-10 rounded-lg border px-3 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Costs */}

      <section className="space-y-5">
        <div>
          <h2 className="font-semibold">Additional Costs</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Shared costs will be allocated across the purchase items.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="shippingCost"
              className="mb-2 block text-sm font-medium"
            >
              Shipping cost
            </label>

            <input
              id="shippingCost"
              type="number"
              min="0"
              step="0.01"
              value={shippingCost}
              onChange={(event) => setShippingCost(Number(event.target.value))}
              className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="additionalCost"
              className="mb-2 block text-sm font-medium"
            >
              Additional cost
            </label>

            <input
              id="additionalCost"
              type="number"
              min="0"
              step="0.01"
              value={additionalCost}
              onChange={(event) =>
                setAdditionalCost(Number(event.target.value))
              }
              className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </section>

      {/* Notes */}

      <section>
        <label htmlFor="notes" className="mb-2 block text-sm font-medium">
          Notes
        </label>

        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional notes about this purchase..."
          className="w-full resize-none rounded-lg border bg-background px-3.5 py-3 text-sm outline-none focus:border-primary"
        />
      </section>

      {/* Summary */}

      <section className="rounded-xl border bg-muted/20 p-5">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>

            <span>{subtotal.toLocaleString()} BDT</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>

            <span>{shippingCost.toLocaleString()} BDT</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Additional</span>

            <span>{additionalCost.toLocaleString()} BDT</span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="font-semibold">Total Cost</span>

              <span className="font-semibold">
                {totalCost.toLocaleString()} BDT
              </span>
            </div>
          </div>
        </div>
      </section>

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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Recording..." : "Record Purchase"}
        </button>
      </div>
    </form>
  );
}
