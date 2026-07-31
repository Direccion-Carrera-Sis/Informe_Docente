import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { TitulacionesModule } from './titulaciones/titulaciones.module';
import { InformesModule } from './informes/informes.module'; // 👉 1. Agregamos esta importación

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/sistema-informes-uce'),
    AsignacionesModule,
    UsuariosModule,
    AuthModule,
    TitulacionesModule,
    InformesModule, // 👉 2. Registramos el módulo aquí
  ],
})
export class AppModule {}
