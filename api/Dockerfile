# Base Debian (evita problema de OpenSSL/musl do Alpine)
FROM node:20-bookworm-slim

# OpenSSL e certificados (necessário para engines do Prisma)
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# pnpm
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

WORKDIR /app

# dependências primeiro (melhor cache)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Prisma client na build
COPY prisma ./prisma
RUN pnpm prisma:generate

# código restante
COPY . .

EXPOSE 3000
CMD ["pnpm", "dev"]
