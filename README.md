# Lista de Compras

Aplicação full-stack para gerenciar itens e categorias de compras.  
Backend em **Fastify + Prisma + PostgreSQL** e frontend em **React (Vite) + TanStack Router/Query + shadcn/ui**.  
Suporta execução em dev e produção (Nginx) via Docker Compose.

---

## Stack

### Backend
- Fastify, Zod (validação), Swagger (docs)  
- Prisma ORM (PostgreSQL)

### Frontend
- React + Vite + TypeScript  
- @tanstack/react-router, @tanstack/react-query  
- shadcn/ui (Radix), tailwindcss, lucide-react, sonner

### Infra
- Docker Compose (serviços: db, api, web dev, web-prod com Nginx)

---

## Arquitetura (resumo)

```
lista-compras/
├─ api/
│  ├─ src/
│  │  ├─ server.ts               # Fastify + CORS + Swagger + rotas
│  │  ├─ plugins/prisma.ts       # Plugin Prisma
│  │  ├─ routes/health.ts
│  │  ├─ routes/itemRoutes.ts    # CRUD de itens
│  │  └─ routes/categoryRoutes.ts# CRUD de categorias
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ seed.ts                 # seeds de categorias (opcional)
│  └─ Dockerfile
├─ web/
│  ├─ src/
│  │  ├─ api/client.ts           # baseURL da API (VITE_API_URL)
│  │  ├─ routes.tsx              # Router
│  │  ├─ screens/ItemsPage.tsx
│  │  └─ screens/CategoriesPage.tsx
│  ├─ index.html / main.tsx / vite.config.ts
│  ├─ tailwind.config.cjs / postcss.config.cjs
│  └─ Dockerfile (build)
├─ web-prod/
│  └─ nginx.conf                 # proxy /api → api:3000 + SPA fallback
├─ docker-compose.yml
└─ README.md
```

---

## Pré-requisitos

- Docker e Docker Compose  
- Portas livres (padrão):  
  - API: `3000`  
  - WEB (dev): `5173`  
  - DB: `5432` (pode mapear para `5433` se já houver Postgres local)  

⚠️ Se a porta 5432 estiver em uso no host, ajuste o mapeamento no `docker-compose.yml` (ex.: `5433:5432`).

---

## Como rodar em desenvolvimento

### Subir serviços
```sh
docker compose up -d --build
```

### Verificar saúde
```sh
curl http://localhost:3000/health        # → {"status":"ok"}
open http://localhost:5173               # frontend
open http://localhost:3000/docs          # swagger
```

### Migrations e Seeds (opcional)
```sh
# criar/atualizar tabelas
docker compose exec api pnpm prisma migrate dev --name init

# popular categorias
docker compose exec api pnpm prisma db seed
```

### Variáveis de ambiente (dev)

**API (api/.env):**
```
DATABASE_URL="postgresql://postgres:postgres@db:5432/shoppinglist?schema=public"
```

**WEB (web/.env):**
```
VITE_API_URL="http://localhost:3000"
```

---

## Como rodar em produção (Nginx)

### Frontend apontando para /api
Crie `web/.env.production`:
```
VITE_API_URL=/api
```

### Nginx (`web-prod/nginx.conf` resumo)
```nginx
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_pass http://api:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location / {
    try_files $uri /index.html;
  }
}
```

### Subir build + Nginx
```sh
docker compose up -d --build web-prod
# Acesse: http://localhost:8080
```

---

## Endpoints (resumo)

### Health
- `GET /health` – health check

### Categorias
- `GET /categories`
- `POST /categories` (body: `{ name }`)
- `PUT /categories/:id`
- `DELETE /categories/:id`

### Itens
- `GET /items?onlyOpen=&page=&perPage=&sortBy=&order=`
- `POST /items` (body: `{ name, qty?, categoryId?, done? }`)
- `PUT /items/:id`
- `PATCH /items/:id/done` (alternar feito/aberto)
- `DELETE /items/:id`

> Validações de payload feitas com **Zod** (`400` em erro).  
> Documentação Swagger disponível em `/docs`.

---

## Scripts úteis

### API
```sh
pnpm dev                      # dev com tsx/ts-node
pnpm prisma migrate dev       # migrations
pnpm prisma db seed           # seed
pnpm prisma studio            # Prisma Studio (se exposto)
```

### WEB
```sh
pnpm dev                      # Vite dev server
pnpm build && pnpm preview    # build local (sem Docker)
```

---

## Problemas comuns (e soluções rápidas)

- **net::ERR_CONNECTION_REFUSED/RESET no frontend**  
  - API não está rodando → `docker compose ps` e `docker compose logs -f api`  
  - `VITE_API_URL` incorreta (dev: `http://localhost:3000`, prod: `/api`)  
  - CORS em dev → `origin: ["http://localhost:5173","http://localhost:8080"]`  

- **Porta 5432 em uso**  
  - Ajustar `docker-compose.yml` (ex.: `5433:5432`) e `DATABASE_URL`  

- **Tailwind/PostCSS “module is not defined in ES module scope”**  
  - Renomear configs para `.cjs`  

- **React Query: “No QueryClient set”**  
  - Envolver app em `<QueryClientProvider client={queryClient}>...</QueryClientProvider>`  

- **shadcn: toasts**  
  - Usar **sonner** no lugar do antigo `use-toast`  

---

## Licença
Este projeto é distribuído sob a licença **MIT**.

---

## Contribuindo
PRs são bem-vindos!  
Ideias:  
- Testes de rota (Vitest + Supertest)  
- Rate-limit no Fastify  
- Logs estruturados (pino)  
- Otimizações de cache no React Query

---

_O ChatGPT pode cometer erros. Considere verificar informações importantes._
