# Lista de Compras

Aplicação full-stack para gerenciar itens e categorias de compras.  
Backend em **Fastify + Prisma + PostgreSQL** e frontend em **React (Vite) + TanStack Router/Query** usando **Docker**.  

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
docker compose start api   
docker compose start web
```

### Verificar saúde
```sh
curl http://localhost:3000/health        # → {"status":"ok"}
```

### Migrations e Seeds (opcional)
```sh
# criar/atualizar tabelas
docker compose exec api pnpm prisma migrate dev --name init

# popular categorias
docker compose exec api pnpm prisma db seed
