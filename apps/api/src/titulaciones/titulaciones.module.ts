import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TitulacionesController } from './titulaciones.controller';
import { TitulacionesService } from './titulaciones.service';
import { Titulacion, TitulacionSchema } from './titulacion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Titulacion.name, schema: TitulacionSchema },
    ]),
  ],
  controllers: [TitulacionesController],
  providers: [TitulacionesService],
})
export class TitulacionesModule {}
