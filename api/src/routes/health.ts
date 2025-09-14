import { FastifyInstance } from "fastify";

/**
 * Rota simples para verificar se o servidor está de pé.
 */
export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return { status: "ok" };
  });
}
