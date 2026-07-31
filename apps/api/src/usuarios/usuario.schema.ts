import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Usuario extends Document {
  @Prop({ required: true, unique: true })
  correo!: string;

  @Prop({ required: true })
  password!: string; // Aquí guardaremos la cédula encriptada

  @Prop({ required: true })
  rol!: string;

  @Prop({ required: true, unique: true })
  cedula!: string;

  @Prop({ required: true })
  nombres_completos!: string;

  @Prop({ type: String, default: '' })
  periodo_academico!: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
