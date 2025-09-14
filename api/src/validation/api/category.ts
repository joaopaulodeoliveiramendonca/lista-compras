import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
});

export const categoryUpdateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
});
