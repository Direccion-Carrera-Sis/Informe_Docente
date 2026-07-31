import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Asignacion extends Document {
  @Prop({ required: true })
  identificacion!: string; // Esta es la clave para conectar con el docente

  @Prop({ required: true })
  nombres_completos!: string;

  @Prop({ required: true })
  carrera!: string;

  @Prop({ required: true })
  codigo!: string;

  @Prop({ required: true })
  materia!: string;

  @Prop({ required: true })
  paralelo!: string;
}

export const AsignacionSchema = SchemaFactory.createForClass(Asignacion);
