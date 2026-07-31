import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesService } from './asignaciones.service';
import { Asignacion, AsignacionSchema } from './asignacion.schema';

@Module({
  imports: [
    // Registramos la colección en MongoDB
    MongooseModule.forFeature([
      { name: Asignacion.name, schema: AsignacionSchema },
    ]),
  ],
  controllers: [AsignacionesController],
  providers: [AsignacionesService],
})
export class AsignacionesModule {}
