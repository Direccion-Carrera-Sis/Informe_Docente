FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# 1. Declarar los argumentos de compilación al inicio para que estén disponibles
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 2. Copiar archivos de configuración y dependencias
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

RUN pnpm install --no-frozen-lockfile

# 3. Copiar TODO el código fuente ANTES de compilar
COPY . .

# 4. Compilar con las variables de entorno ya inyectadas y el código presente
RUN pnpm --filter web build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

CMD ["node", "apps/web/server.js"]