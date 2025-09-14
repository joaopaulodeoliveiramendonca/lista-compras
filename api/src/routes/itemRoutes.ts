import { FastifyInstance } from "fastify";
import {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

export async function itemRoutes(app: FastifyInstance) {
  // Schemas reutilizáveis (para o Swagger)
  app.addSchema({
    $id: "Item",
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      quantity: { type: "integer" },
      done: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  });

  app.addSchema({
    $id: "Error",
    type: "object",
    properties: { message: { type: "string" } },
  });

  app.get(
    "/items",
    {
      schema: {
        tags: ["Items"],
        summary: "Listar itens",
        querystring: {
          type: "object",
          properties: {
            q: { type: "string" },
            done: { type: "boolean" },
            page: { type: "integer", minimum: 1, default: 1 },
            perPage: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            sort: { type: "string", enum: ["createdAt", "name", "quantity"], default: "createdAt" },
            order: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: { type: "array", items: { $ref: "Item#" } },
              meta: {
                type: "object",
                properties: {
                  page: { type: "integer" },
                  perPage: { type: "integer" },
                  total: { type: "integer" },
                  totalPages: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
    listItems
  );

  app.get(
    "/items/:id",
    {
      schema: {
        tags: ["Items"],
        summary: "Detalhar item",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: { 200: { $ref: "Item#" }, 404: { $ref: "Error#" } },
      },
    },
    getItem
  );

  app.post(
    "/items",
    {
      schema: {
        tags: ["Items"],
        summary: "Criar item",
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            quantity: { type: "integer", minimum: 1, default: 1 },
            done: { type: "boolean", default: false },
          },
          additionalProperties: false,
        },
        response: { 201: { $ref: "Item#" } },
      },
    },
    createItem
  );

  app.patch(
    "/items/:id",
    {
      schema: {
        tags: ["Items"],
        summary: "Atualizar item",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            quantity: { type: "integer", minimum: 1 },
            done: { type: "boolean" },
          },
          additionalProperties: false,
        },
        response: { 200: { $ref: "Item#" }, 404: { $ref: "Error#" } },
      },
    },
    updateItem
  );

  app.delete(
    "/items/:id",
    {
      schema: {
        tags: ["Items"],
        summary: "Remover item",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: { 204: { type: "null" }, 404: { $ref: "Error#" } },
      },
    },
    deleteItem
  );
}
