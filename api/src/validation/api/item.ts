import { z } from "zod";

export const itemQuerySchema = z.object({
  search: z.string().trim().optional(),
  onlyOpen: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform(v => v === "true"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "quantity", "done"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  categoryId: z.string().uuid().optional(),
});

export const itemCreateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  quantity: z.coerce.number().int().min(1, "Quantidade deve ser >= 1").default(1),
  done: z.coerce.boolean().optional().default(false),
  categoryId: z.string().uuid().optional().nullable(),
});

export const itemUpdateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").optional(),
  quantity: z.coerce.number().int().min(1, "Quantidade deve ser >= 1").optional(),
  done: z.coerce.boolean().optional(),
  categoryId: z.string().uuid().nullable().optional(),
});

export type ItemCreateInput = z.infer<typeof itemCreateSchema>;
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>;
