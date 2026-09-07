import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { TitulacionesModule } from './titulaciones/titulaciones.module';
import { InformesModule } from './informes/informes.module';

@Module({
  imports: [
    // Ahora lee la conexión desde Docker, pero si estás en local usa la ruta de siempre
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://127.0.0.1:27017/sistema-informes-uce',
    ),
    AsignacionesModule,
    UsuariosModule,
    AuthModule,
    TitulacionesModule,
    InformesModule,
  ],
})
export class AppModule {}
