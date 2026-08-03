/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Informe } from './schemas/informe.schema';

@Injectable()
export class InformesService {
  constructor(
    @InjectModel(Informe.name) private readonly informeModel: Model<Informe>,
  ) {}

  async crear(datos: any): Promise<Informe> {
    // Crea una nueva instancia del modelo con los datos recibidos
    const nuevoInforme = new this.informeModel(datos);
    // Guarda el documento en MongoDB
    return await nuevoInforme.save();
  }

  async obtenerTodos(): Promise<Informe[]> {
    return await this.informeModel.find().exec();
  }

  // Obtiene solo los informes de un docente específico
  async obtenerPorDocente(docenteId: string): Promise<Informe[]> {
    return await this.informeModel.find({ docenteId }).exec();
  }

  // Buscar un informe específico por su ID
  async findOne(id: string) {
    return this.informeModel.findById(id).exec();
  }

  // Actualizar un informe existente
  async update(id: string, updateData: any) {
    return this.informeModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  // Eliminar un informe
  async remove(id: string) {
    return this.informeModel.findByIdAndDelete(id).exec();
  }
}
