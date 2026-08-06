import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Informe, InformeSchema } from './schemas/informe.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { InformesController } from './informes.controller';
import { InformesService } from './informes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Informe.name, schema: InformeSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [InformesController],
  providers: [InformesService],
})
export class InformesModule {}
