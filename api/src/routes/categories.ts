import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { PrismaClient } from "@prisma/client";
import { categoryCreateSchema, categoryUpdateSchema } from "../validation/api/category";

const prisma = new PrismaClient();

const routes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Listar
  app.get("/", async () => {
    const data = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return { data };
  });

  // Criar
  app.post("/", async (req, reply) => {
    const parsed = categoryCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.issues[0]?.message || "Dados inválidos" });
    }
    const exists = await prisma.category.findFirst({ where: { name: parsed.data.name } });
    if (exists) return reply.code(409).send({ message: "Nome já existe" });

    const created = await prisma.category.create({ data: { name: parsed.data.name } });
    return reply.code(201).send(created);
  });

  // Atualizar
  app.patch("/:id", async (req, reply) => {
    const id = (req.params as any).id as string;
    const parsed = categoryUpdateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ message: parsed.error.issues[0]?.message });

    try {
      const updated = await prisma.category.update({
        where: { id },
        data: { name: parsed.data.name },
      });
      return updated;
    } catch {
      return reply.code(404).send({ message: "Categoria não encontrada" });
    }
  });

  // Remover (bloqueia se houver itens ligados)
  app.delete("/:id", async (req, reply) => {
    const id = (req.params as any).id as string;

    const count = await prisma.item.count({ where: { categoryId: id } });
    if (count > 0) {
      return reply.code(409).send({ message: "Existem itens nessa categoria. Remova-os ou mova-os antes." });
    }

    try {
      await prisma.category.delete({ where: { id } });
      return reply.code(204).send();
    } catch {
      return reply.code(404).send({ message: "Categoria não encontrada" });
    }
  });
};

export default routes;
