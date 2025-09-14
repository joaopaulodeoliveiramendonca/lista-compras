import Fastify from "fastify";
import cors from "@fastify/cors";
import itemsRoutes from "./routes/items";
import categoriesRoutes from "./routes/categories";

const app = Fastify();

await app.register(cors, {
  origin: ["http://localhost:5173", "http://localhost:8080"],
});

// health
app.get("/health", async () => ({ status: "ok" }));

// rotas
await app.register(categoriesRoutes, { prefix: "/categories" });
await app.register(itemsRoutes, { prefix: "/items" });

await app.listen({ host: "0.0.0.0", port: 3000 });
