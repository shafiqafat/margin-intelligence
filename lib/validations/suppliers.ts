import { z } from "zod";

export const supplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Supplier name is required")
    .max(150, "Supplier name is too long"),

  contactName: z
    .string()
    .trim()
    .max(150, "Contact name is too long")
    .optional(),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(150, "Email is too long")
    .optional()
    .or(z.literal("")),

  phone: z.string().trim().max(50, "Phone number is too long").optional(),

  notes: z.string().trim().max(1000, "Notes are too long").optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
