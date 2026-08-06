import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true }) // Automáticamente añade fecha de creación y actualización
export class Informe extends Document {
  @Prop({ required: true, index: true })
  docenteId!: string; // <-- Nota el signo de exclamación (!)

  @Prop({ required: true })
  periodoAcademico!: string;

  @Prop({ required: true, default: 'Borrador' })
  estado!: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  datosEstructurales!: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  actividades!: Record<string, any>;

  @Prop({ default: 0 })
  progreso!: number;
}

export const InformeSchema = SchemaFactory.createForClass(Informe);
