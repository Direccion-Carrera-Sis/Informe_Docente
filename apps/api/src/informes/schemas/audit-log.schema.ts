import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true })
  accion!: string;

  @Prop({ required: true })
  coleccionAfectada!: string;

  @Prop({ required: true })
  documentoId!: string;

  @Prop({ required: true })
  usuarioId!: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  detallesAnteriores?: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  detallesNuevos?: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
