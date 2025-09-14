import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import prismaPlugin from "./plugins/prisma.js";
import { healthRoutes } from "./routes/health.js";
import { itemRoutes } from "./routes/itemRoutes.js";
import { ZodError } from "zod";

const PORT = Number(process.env.PORT || 3000);

async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  await app.register(swagger, {
    openapi: {
      info: { title: "Lista de Compras API", version: "0.1.0" },
    },
  });
  await app.register(swaggerUI, { routePrefix: "/docs" });

  await app.register(prismaPlugin);

  // Rotas
  await app.register(healthRoutes);
  await app.register(itemRoutes); // <- CRUD de itens

  // Tratamento de erros (inclui Zod)
  app.setErrorHandler((error, req, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        message: "Erro de validação",
        issues: error.flatten(),
      });
    }
    req.log.error(error);
    return reply.code(500).send({ message: "Erro interno" });
  });

  return app;
}

buildServer()
  .then((app) => app.listen({ port: PORT, host: "0.0.0.0" }))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
