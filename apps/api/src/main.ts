/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // Permite que la URL del frontend se inyecte desde el servidor, o usa localhost
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  // Añadimos '0.0.0.0' para que Docker asigne correctamente las interfaces de red
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API corriendo en el puerto ${port}`);
}
bootstrap();
