import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(150, "Product name is too long"),

  sku: z.string().trim().max(50, "SKU is too long").optional(),

  category: z.string().trim().max(100, "Category is too long").optional(),

  sellingPrice: z.number().min(0, "Selling price cannot be negative"),

  targetMargin: z
    .number()
    .min(0, "Target margin cannot be below 0%")
    .max(100, "Target margin cannot exceed 100%"),
});

export type ProductFormData = z.infer<typeof productSchema>;
