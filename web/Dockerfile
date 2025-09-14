# ---------- STAGE 1: build ----------
FROM node:20-alpine AS build
WORKDIR /app

# habilita pnpm
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

# instala deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# copia o código e gera o build
COPY . .
# se quiser apontar a API explicitamente em prod, crie .env.production (veja 5.4)
RUN pnpm build

# ---------- STAGE 2: nginx ----------
FROM nginx:1.27-alpine AS runner
# nginx conf com fallback de SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
# copia o build
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
