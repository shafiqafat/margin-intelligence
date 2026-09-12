"use client";

import { useMemo, useState, useTransition } from "react";

import { createReturnAction } from "@/app/(dashboard)/transactions/returns/new/actions";

type SaleItem = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  product: {
    id: string;
    name: string;
    sku: string | null;
  } | null;
};

type Sale = {
  id: string;
  sale_date: string;
  reference: string | null;
  sale_items: SaleItem[];
};

type ReturnRecord = {
  id: string;
  sale_id: string | null;
  product_id: string;
  quantity: number;
  refund_amount: number;
  return_shipping_cost: number;
  restocking_cost: number;
};

type ReturnFormProps = {
  businessId: string;
  sales: Sale[];
  returns: ReturnRecord[];
};

export function ReturnForm({ businessId, sales, returns }: ReturnFormProps) {
  const [isPending, startTransition] = useTransition();

  const [saleId, setSaleId] = useState("");
  const [productId, setProductId] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [refundAmount, setRefundAmount] = useState(0);
  const [returnShippingCost, setReturnShippingCost] = useState(0);
  const [restockingCost, setRestockingCost] = useState(0);

  const [reason, setReason] = useState("");
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");

  const selectedSale = useMemo(
    () => sales.find((sale) => sale.id === saleId) ?? null,
    [sales, saleId],
  );

  const saleProducts = useMemo(() => {
    if (!selectedSale) {
      return [];
    }

    const grouped = new Map<
      string,
      {
        productId: string;
        productName: string;
        sku: string | null;
        soldQuantity: number;
        productRevenue: number;
      }
    >();

    for (const item of selectedSale.sale_items) {
      if (!item.product) {
        continue;
      }

      const existing = grouped.get(item.product_id);

      if (existing) {
        existing.soldQuantity += item.quantity;
        existing.productRevenue += item.total_price;
      } else {
        grouped.set(item.product_id, {
          productId: item.product_id,
          productName: item.product.name,
          sku: item.product.sku,
          soldQuantity: item.quantity,
          productRevenue: item.total_price,
        });
      }
    }

    return Array.from(grouped.values());
  }, [selectedSale]);

  const selectedProduct = useMemo(
    () =>
      saleProducts.find((product) => product.productId === productId) ?? null,
    [saleProducts, productId],
  );

  const alreadyReturned = useMemo(() => {
    if (!saleId || !productId) {
      return 0;
    }

    return returns
      .filter(
        (returnRecord) =>
          returnRecord.sale_id === saleId &&
          returnRecord.product_id === productId,
      )
      .reduce((total, returnRecord) => total + returnRecord.quantity, 0);
  }, [returns, saleId, productId]);

  const availableQuantity = selectedProduct
    ? Math.max(0, selectedProduct.soldQuantity - alreadyReturned)
    : 0;

  const refundPerUnit = selectedProduct
    ? selectedProduct.soldQuantity > 0
      ? selectedProduct.productRevenue / selectedProduct.soldQuantity
      : 0
    : 0;

  function handleSaleChange(nextSaleId: string) {
    setSaleId(nextSaleId);
    setProductId("");
    setQuantity(1);
    setRefundAmount(0);
    setError("");
  }

  function handleProductChange(nextProductId: string) {
    setProductId(nextProductId);
    setQuantity(1);

    const product = saleProducts.find(
      (item) => item.productId === nextProductId,
    );

    if (product) {
      setRefundAmount(Number(product.productRevenue / product.soldQuantity));
    } else {
      setRefundAmount(0);
    }

    setError("");
  }

  function handleQuantityChange(nextQuantity: number) {
    setQuantity(nextQuantity);

    if (selectedProduct) {
      setRefundAmount(Number((refundPerUnit * nextQuantity).toFixed(2)));
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!saleId) {
      setError("Please select a sale.");
      return;
    }

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    if (availableQuantity <= 0) {
      setError("There is no remaining quantity available to return.");
      return;
    }

    if (quantity <= 0 || quantity > availableQuantity) {
      setError(`Return quantity must be between 1 and ${availableQuantity}.`);
      return;
    }

    if (refundAmount < 0) {
      setError("Refund amount cannot be negative.");
      return;
    }

    if (returnShippingCost < 0) {
      setError("Return shipping cost cannot be negative.");
      return;
    }

    if (restockingCost < 0) {
      setError("Restocking cost cannot be negative.");
      return;
    }

    startTransition(async () => {
      const result = await createReturnAction(businessId, {
        saleId,
        productId,
        quantity,
        reason: reason.trim() || undefined,
        refundAmount,
        returnShippingCost,
        restockingCost,
        returnDate,
        notes: notes.trim() || undefined,
      });

      if (result?.success === false) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Return Information */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Return Information</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select the original sale and product being returned.
          </p>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sale</label>

            <div className="relative">
              <select
                value={saleId}
                onChange={(event) => handleSaleChange(event.target.value)}
                className="h-10 w-full appearance-none rounded-md border bg-background px-4 pr-12 text-sm"
              >
                <option value="">Select sale</option>

                {sales.map((sale) => (
                  <option key={sale.id} value={sale.id}>
                    {sale.reference ?? "Sale"} — {sale.sale_date}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Return Date</label>

            <input
              type="date"
              value={returnDate}
              onChange={(event) => setReturnDate(event.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Product</label>

              {selectedProduct && (
                <span className="text-xs text-muted-foreground">
                  {availableQuantity} available to return
                </span>
              )}
            </div>

            <div className="relative">
              <select
                value={productId}
                onChange={(event) => handleProductChange(event.target.value)}
                disabled={!selectedSale}
                className="h-10 w-full appearance-none rounded-md border bg-background px-4 pr-12 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {selectedSale ? "Select product" : "Select a sale first"}
                </option>

                {saleProducts.map((product) => {
                  const returned = returns
                    .filter(
                      (item) =>
                        item.sale_id === saleId &&
                        item.product_id === product.productId,
                    )
                    .reduce((total, item) => total + item.quantity, 0);

                  const available = Math.max(
                    0,
                    product.soldQuantity - returned,
                  );

                  return (
                    <option
                      key={product.productId}
                      value={product.productId}
                      disabled={available <= 0}
                    >
                      {product.productName}
                      {product.sku ? ` (${product.sku})` : ""} — {available}{" "}
                      available
                    </option>
                  );
                })}
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            {selectedProduct && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Sold: {selectedProduct.soldQuantity}</span>

                <span>•</span>

                <span>Already returned: {alreadyReturned}</span>

                <span>•</span>

                <span className="font-medium text-foreground">
                  Available: {availableQuantity}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Return Quantity */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Return Quantity</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            The available quantity is calculated from the original sale and
            previous returns.
          </p>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Sold</p>

            <p className="mt-1 text-xl font-semibold">
              {selectedProduct?.soldQuantity ?? 0}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Already Returned</p>

            <p className="mt-1 text-xl font-semibold">{alreadyReturned}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Available</p>

            <p className="mt-1 text-xl font-semibold">{availableQuantity}</p>
          </div>

          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-medium">Quantity to Return</label>

            <input
              type="number"
              min="1"
              max={availableQuantity}
              step="1"
              value={quantity}
              disabled={!selectedProduct}
              onChange={(event) =>
                handleQuantityChange(Number(event.target.value))
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </section>

      {/* Refund & Costs */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Refund & Return Costs</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Record the financial impact of the return.
          </p>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Refund Amount</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={refundAmount}
              onChange={(event) => setRefundAmount(Number(event.target.value))}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />

            <p className="text-xs text-muted-foreground">
              Suggested from the original product sale value.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Return Shipping Cost</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={returnShippingCost}
              onChange={(event) =>
                setReturnShippingCost(Number(event.target.value))
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Restocking Cost</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={restockingCost}
              onChange={(event) =>
                setRestockingCost(Number(event.target.value))
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>
        </div>
      </section>

      {/* Reason & Notes */}
      <section className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Return Details</h2>
        </div>

        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>

            <input
              type="text"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Wrong size"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes about this return"
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !selectedProduct || availableQuantity <= 0}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Recording Return..." : "Record Return"}
        </button>
      </div>
    </form>
  );
}
