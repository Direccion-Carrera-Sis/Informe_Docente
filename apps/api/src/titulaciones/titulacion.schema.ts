import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Titulacion extends Document {
  @Prop({ required: true })
  identificacion_docente!: string;

  @Prop()
  docente_nombre!: string;

  @Prop({ required: true })
  estudiante!: string;

  @Prop({ required: true })
  tema!: string;

  @Prop()
  carrera!: string;

  @Prop()
  mecanismo!: string;
}

export const TitulacionSchema = SchemaFactory.createForClass(Titulacion);
