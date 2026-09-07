# Usamos una imagen ligera de Node.js
FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiamos TODOS los archivos del monorepo a la raíz del contenedor
COPY . .

# Instalamos las dependencias desde la raíz (vital para Turborepo/Workspaces)
RUN npm install

# Nos movemos a la carpeta de la API y compilamos
WORKDIR /app/apps/api
RUN npm run build

# Exponemos el puerto
EXPOSE 4000

# Comando para iniciar en producción
CMD ["npm", "run", "start:prod"]