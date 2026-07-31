import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 AÑADE ESTA LÍNEA PARA PERMITIR LA CONEXIÓN DESDE REACT 👇
  app.enableCors({
    origin: 'http://localhost:3000', // Solo permitimos peticiones de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Asegúrate de que tu puerto siga siendo el 4000
  await app.listen(4000);
}
bootstrap();
