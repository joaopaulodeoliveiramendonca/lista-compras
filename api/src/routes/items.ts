import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { PrismaClient } from "@prisma/client";
import { itemCreateSchema, itemQuerySchema, itemUpdateSchema } from "../validation/api/item";

const prisma = new PrismaClient();

const routes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Listar com paginação/ordenação/filtros
  app.get("/", async (req, reply) => {
    const parsed = itemQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.issues[0]?.message || "Parâmetros inválidos" });
    }
    const { search, onlyOpen, page, perPage, sortBy, order, categoryId } = parsed.data;

    const where = {
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...(onlyOpen ? { done: false } : {}),
      ...(categoryId ? { categoryId } : {}),
    };

    const total = await prisma.item.count({ where });
    const items = await prisma.item.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { category: true },
    });

    return {
      data: items,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
        sortBy,
        order,
      },
    };
  });

  // Criar
  app.post("/", async (req, reply) => {
    const parsed = itemCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.issues[0]?.message || "Dados inválidos" });
    }

    const created = await prisma.item.create({
      data: {
        name: parsed.data.name,
        quantity: parsed.data.quantity,
        done: parsed.data.done ?? false,
        categoryId: parsed.data.categoryId ?? null,
      },
    });

    return reply.code(201).send(created);
  });

  // Atualizar
  app.patch("/:id", async (req, reply) => {
    const id = (req.params as any).id as string;
    const parsed = itemUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.issues[0]?.message || "Dados inválidos" });
    }

    try {
      const updated = await prisma.item.update({
        where: { id },
        data: {
          ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
          ...(parsed.data.quantity !== undefined ? { quantity: parsed.data.quantity } : {}),
          ...(parsed.data.done !== undefined ? { done: parsed.data.done } : {}),
          ...(parsed.data.categoryId !== undefined ? { categoryId: parsed.data.categoryId } : {}),
        },
      });
      return updated;
    } catch {
      return reply.code(404).send({ message: "Item não encontrado" });
    }
  });

  // Remover
  app.delete("/:id", async (req, reply) => {
    const id = (req.params as any).id as string;
    try {
      await prisma.item.delete({ where: { id } });
      return reply.code(204).send();
    } catch {
      return reply.code(404).send({ message: "Item não encontrado" });
    }
  });
};

export default routes;
