# Usamos una imagen ligera de Node.js
FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /app

# Instalamos pnpm
RUN npm install -g pnpm

# Copiamos los archivos necesarios del workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# Instalamos las dependencias del monorepo
RUN pnpm install --frozen-lockfile

# Copiamos el resto del código
COPY . .

# Nos movemos a la carpeta de la API y compilamos
WORKDIR /app/apps/api
RUN pnpm run build

# Exponemos el puerto
EXPOSE 4000

# Comando para iniciar en producción
CMD ["pnpm", "run", "start:prod"]