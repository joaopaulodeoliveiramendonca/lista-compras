import { z } from "zod";

export const itemCreateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  quantity: z.coerce.number().int().min(1, "Quantidade deve ser >= 1"),
  done: z.boolean().optional(),
  categoryId: z.string().uuid().optional().nullable(),
});

export const itemUpdateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").optional(),
  quantity: z.coerce.number().int().min(1, "Quantidade deve ser >= 1").optional(),
  done: z.boolean().optional(),
  categoryId: z.string().uuid().nullable().optional(),
});
