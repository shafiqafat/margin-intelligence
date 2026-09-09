import { z } from "zod";

const purchaseItemSchema = z.object({
  productId: z.string().uuid("Invalid product"),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unitCost: z.number().min(0, "Unit cost cannot be negative"),
});

export const purchaseSchema = z.object({
  supplierId: z.string().uuid("Supplier is required"),

  purchaseDate: z.string().min(1, "Purchase date is required"),

  reference: z.string().trim().max(100, "Reference is too long").optional(),

  shippingCost: z.number().min(0, "Shipping cost cannot be negative"),

  additionalCost: z.number().min(0, "Additional cost cannot be negative"),

  notes: z.string().trim().max(1000, "Notes are too long").optional(),

  items: z.array(purchaseItemSchema).min(1, "At least one product is required"),
});

export type PurchaseFormData = z.infer<typeof purchaseSchema>;
