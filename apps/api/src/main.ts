/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.enableCors({
    // Permite que la URL del frontend se inyecte desde el servidor, o usa localhost
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  // Añadimos '0.0.0.0' para que Docker asigne correctamente las interfaces de red
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API corriendo en el puerto ${port}`);
}
bootstrap();
