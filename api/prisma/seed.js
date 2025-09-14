import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const CATS = ["Mercearia", "Hortifruti", "Açougue", "Padaria", "Bebidas"];

try {
  for (const name of CATS) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Seed de categorias ok:", CATS.join(", "));
} catch (e) {
  console.error("Erro no seed:", e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
