import { FastifyReply, FastifyRequest } from "fastify";
import {
  itemCreateSchema,
  itemUpdateSchema,
  itemIdParamSchema,
  listQuerySchema,
} from "../schemas/itemSchemas.js";

export async function listItems(req: FastifyRequest, reply: FastifyReply) {
  const { q, done, page, perPage, sort, order } = listQuerySchema.parse(req.query);

  const where: any = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (typeof done === "boolean") where.done = done;

  const [items, total] = await Promise.all([
    req.server.prisma.item.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    req.server.prisma.item.count({ where }),
  ]);

  return reply.send({
    data: items,
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
}

export async function getItem(req: FastifyRequest, reply: FastifyReply) {
  const { id } = itemIdParamSchema.parse(req.params);
  const item = await req.server.prisma.item.findUnique({ where: { id } });
  if (!item) return reply.code(404).send({ message: "Item não encontrado" });
  return item;
}

export async function createItem(req: FastifyRequest, reply: FastifyReply) {
  const data = itemCreateSchema.parse(req.body);
  const item = await req.server.prisma.item.create({ data });
  return reply.code(201).send(item);
}

export async function updateItem(req: FastifyRequest, reply: FastifyReply) {
  const { id } = itemIdParamSchema.parse(req.params);
  const data = itemUpdateSchema.parse(req.body);
  try {
    const item = await req.server.prisma.item.update({ where: { id }, data });
    return item;
  } catch {
    return reply.code(404).send({ message: "Item não encontrado" });
  }
}

export async function deleteItem(req: FastifyRequest, reply: FastifyReply) {
  const { id } = itemIdParamSchema.parse(req.params);
  try {
    await req.server.prisma.item.delete({ where: { id } });
    return reply.code(204).send();
  } catch {
    return reply.code(404).send({ message: "Item não encontrado" });
  }
}
