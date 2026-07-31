import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InformesController } from './informes.controller';
import { InformesService } from './informes.service';
import { Informe, InformeSchema } from './schemas/informe.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Informe.name, schema: InformeSchema }]),
  ],
  controllers: [InformesController],
  providers: [InformesService],
})
export class InformesModule {}
