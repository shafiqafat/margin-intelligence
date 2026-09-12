"use client";

import { useState, useTransition } from "react";

import { createSaleAction } from "@/app/(dashboard)/transactions/sales/new/actions";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  selling_price: number;
};

type SaleFormProps = {
  businessId: string;
  products: Product[];
};

type SaleItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
};

export function SaleForm({ businessId, products }: SaleFormProps) {
  const [isPending, startTransition] = useTransition();

  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [reference, setReference] = useState("");

  const [shippingRevenue, setShippingRevenue] = useState(0);

  const [deliveryCost, setDeliveryCost] = useState(0);

  const [paymentFee, setPaymentFee] = useState(0);

  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<SaleItem[]>([
    {
      productId: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
    },
  ]);

  const [error, setError] = useState("");

  function addItem() {
    setItems((current) => [
      ...current,
      {
        productId: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function updateItem(
    index: number,
    field: keyof SaleItem,
    value: string | number,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function handleProductChange(index: number, productId: string) {
    const product = products.find((item) => item.id === productId);

    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              productId,
              unitPrice: product?.selling_price ?? 0,
            }
          : item,
      ),
    );
  }

  const productRevenue = items.reduce(
    (total, item) => total + item.quantity * item.unitPrice - item.discount,
    0,
  );

  const collectedRevenue = productRevenue + shippingRevenue;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!saleDate) {
      setError("Sale date is required.");
      return;
    }

    if (items.length === 0) {
      setError("At least one product is required.");
      return;
    }

    for (const item of items) {
      if (!item.productId) {
        setError("Please select a product for every item.");
        return;
      }

      if (item.quantity <= 0) {
        setError("Quantity must be greater than zero.");
        return;
      }

      if (item.unitPrice < 0) {
        setError("Unit price cannot be negative.");
        return;
      }

      if (item.discount < 0) {
        setError("Discount cannot be negative.");
        return;
      }

      if (item.discount > item.quantity * item.unitPrice) {
        setError("Discount cannot exceed the item value.");
        return;
      }
    }

    startTransition(async () => {
      const result = await createSaleAction(businessId, {
        saleDate,
        reference: reference.trim() || undefined,
        shippingRevenue,
        deliveryCost,
        paymentFee,
        notes: notes.trim() || undefined,
        items,
      });

      if (result?.success === false) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sale Information */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Sale Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Record the basic details of this sale.
          </p>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sale Date</label>

            <input
              type="date"
              value={saleDate}
              onChange={(event) => setSaleDate(event.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reference</label>

            <input
              type="text"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="e.g. ORD-2005"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Notes</label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes about this sale"
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {/* Sale Items */}
      <section className="rounded-xl border bg-background">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-semibold">Sale Items</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the products included in this sale.
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Add Product
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Product</th>
                <th className="px-5 py-3 text-right font-medium">Quantity</th>
                <th className="px-5 py-3 text-right font-medium">Unit Price</th>
                <th className="px-5 py-3 text-right font-medium">Discount</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y">
              {items.map((item, index) => {
                const lineTotal =
                  item.quantity * item.unitPrice - item.discount;

                return (
                  <tr key={index}>
                    <td className="px-5 py-4">
                      <select
                        value={item.productId}
                        onChange={(event) =>
                          handleProductChange(index, event.target.value)
                        }
                        className="h-10 w-full min-w-[220px] rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="">Select product</option>

                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                            {product.sku ? ` (${product.sku})` : ""}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "quantity",
                            Number(event.target.value),
                          )
                        }
                        className="h-10 w-24 rounded-md border bg-background px-3 text-right text-sm"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "unitPrice",
                            Number(event.target.value),
                          )
                        }
                        className="h-10 w-32 rounded-md border bg-background px-3 text-right text-sm"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discount}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "discount",
                            Number(event.target.value),
                          )
                        }
                        className="h-10 w-28 rounded-md border bg-background px-3 text-right text-sm"
                      />
                    </td>

                    <td className="px-5 py-4 text-right font-medium">
                      {lineTotal.toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-sm text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Revenue & Costs */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Revenue & Selling Costs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Record shipping revenue and costs associated with fulfilling the
            sale.
          </p>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium">Revenue</h3>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Shipping Revenue
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingRevenue}
                  onChange={(event) =>
                    setShippingRevenue(Number(event.target.value))
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="font-medium">Product Revenue</span>

                <span className="font-semibold">
                  {productRevenue.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold">Collected Revenue</span>

                <span className="font-semibold">
                  {collectedRevenue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Selling Costs</h3>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Delivery Cost
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={deliveryCost}
                  onChange={(event) =>
                    setDeliveryCost(Number(event.target.value))
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Payment Fee
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentFee}
                  onChange={(event) =>
                    setPaymentFee(Number(event.target.value))
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Creating Sale..." : "Create Sale"}
        </button>
      </div>
    </form>
  );
}
