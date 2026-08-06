/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Informe } from './schemas/informe.schema';
import { AuditLog } from './schemas/audit-log.schema';

@Injectable()
export class InformesService {
  constructor(
    @InjectModel(Informe.name) private readonly informeModel: Model<Informe>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  // ==========================================
  // CREAR
  // ==========================================
  async crear(datos: any): Promise<Informe> {
    // 1. Crea y guarda el informe
    const nuevoInforme = new this.informeModel(datos);
    const guardado = await nuevoInforme.save();

    // 2. Guarda el LOG
    await this.auditLogModel.create({
      accion: 'CREAR',
      coleccionAfectada: 'Informes',
      documentoId: guardado._id.toString(),
      usuarioId: datos.docenteId || 'Desconocido',
      detallesNuevos: datos,
    });

    return guardado;
  }

  // ==========================================
  // LECTURA (Sin logs, no modifican datos)
  // ==========================================
  async obtenerTodos(): Promise<Informe[]> {
    return await this.informeModel.find().exec();
  }

  async obtenerPorDocente(docenteId: string): Promise<Informe[]> {
    return await this.informeModel.find({ docenteId }).exec();
  }

  async findOne(id: string) {
    return this.informeModel.findById(id).exec();
  }

  // ==========================================
  // ACTUALIZAR
  // ==========================================
  async update(id: string, updateData: any, usuarioEjecutorId: string) {
    // 1. Buscamos el estado ANTERIOR (usamos .lean() para traer solo el objeto JSON limpio)
    const informeAnterior = await this.informeModel.findById(id).lean().exec();
    if (!informeAnterior) {
      throw new NotFoundException('Informe no encontrado');
    }

    // 2. Actualizamos el informe
    const informeActualizado = await this.informeModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    // 3. Guardamos el LOG
    await this.auditLogModel.create({
      accion: 'ACTUALIZAR',
      coleccionAfectada: 'Informes',
      documentoId: id,
      usuarioId: usuarioEjecutorId,
      detallesAnteriores: informeAnterior,
      detallesNuevos: updateData,
    });

    return informeActualizado;
  }

  // ==========================================
  // ELIMINAR
  // ==========================================
  async remove(id: string, usuarioEjecutorId: string) {
    // 1. Buscamos el informe antes de que desaparezca
    const informeAEliminar = await this.informeModel.findById(id).lean().exec();
    if (!informeAEliminar) {
      throw new NotFoundException('Informe no encontrado');
    }

    // 2. Lo eliminamos de la base de datos
    await this.informeModel.findByIdAndDelete(id).exec();

    // 3. Guardamos el LOG con toda la evidencia
    await this.auditLogModel.create({
      accion: 'ELIMINAR',
      coleccionAfectada: 'Informes',
      documentoId: id,
      usuarioId: usuarioEjecutorId,
      detallesAnteriores: informeAEliminar,
    });

    return { mensaje: 'Informe eliminado correctamente' };
  }
}
