import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller'; // <-- 1. Importamos el controlador
import { Usuario, UsuarioSchema } from './usuario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
  ],
  controllers: [UsuariosController], // <-- 2. Lo agregamos aquí
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
