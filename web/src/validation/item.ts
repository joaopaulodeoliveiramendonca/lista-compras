import { z } from "zod";

export const itemSchema = z.object({
  name: z
    .string({ required_error: "Nome é obrigatório" })
    .trim()
    .min(1, "Nome é obrigatório")
    .max(60, "Máximo 60 caracteres"),
  quantity: z
    .coerce.number({ invalid_type_error: "Quantidade precisa ser número" })
    .int("Quantidade precisa ser inteira")
    .positive("Informe pelo menos 1")
    .max(999, "Máximo 999"),
  done: z.boolean().optional().default(false),
});

export type ItemForm = z.infer<typeof itemSchema>;
