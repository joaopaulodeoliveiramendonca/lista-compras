import { z } from "zod";

// Body para criar
export const itemCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  quantity: z.number().int().min(1).optional().default(1),
  done: z.boolean().optional().default(false),
});

// Body para atualizar (pelo menos 1 campo)
export const itemUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.number().int().min(1).optional(),
  done: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Informe ao menos um campo para atualizar",
});

// Param de rota /:id
export const itemIdParamSchema = z.object({
  id: z.string().uuid(),
});

// Query de listagem com paginação/filtro
export const listQuerySchema = z.object({
  q: z.string().optional(),
  done: z.coerce.boolean().optional(),         // converte "true"/"false"
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(["createdAt", "name", "quantity"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});
