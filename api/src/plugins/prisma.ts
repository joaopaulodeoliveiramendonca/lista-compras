import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

/**
 * Plugin do Fastify para disponibilizar o Prisma em fastify.prisma
 * Assim podemos usar em qualquer controller/rota via server.prisma
 */
export default fp(async (fastify) => {
  const prisma = new PrismaClient();

  // fecha a conexão quando o servidor encerrar
  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  // "decorates" = adiciona propriedade no fastify
  fastify.decorate("prisma", prisma);
});

// Extensão de tipos para o TypeScript saber que fastify.prisma existe
declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
