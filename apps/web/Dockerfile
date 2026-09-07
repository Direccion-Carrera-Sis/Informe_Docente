# Usamos la misma imagen base
FROM node:20-alpine

WORKDIR /app

# Copiamos todo el monorepo
COPY . .

# Instalamos dependencias desde la raíz
RUN npm install

# Nos movemos a la carpeta del frontend y compilamos
WORKDIR /app/apps/web
# Pasamos la variable de entorno para que quede fijada en el build de Next.js
ENV NEXT_PUBLIC_API_URL=http://localhost:4000
RUN npm run build

EXPOSE 3000

# Iniciamos el servidor de Next.js
CMD ["npm", "run", "start"]