/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Readable } from 'stream';
import { Asignacion } from './asignacion.schema';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const csv = require('csv-parser');

@Injectable()
export class AsignacionesService {
  constructor(
    @InjectModel(Asignacion.name) private asignacionModel: Model<Asignacion>,
  ) {}

  async cargarAsignacionesDesdeCsv(file: any): Promise<any> {
    const resultados: any[] = [];
    const stream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(
          csv({
            separator: ';', // Usamos el punto y coma que te funciona bien
            mapHeaders: ({ header }: any) => {
              // Limpiamos espacios, minúsculas, quitamos tildes (ej: código -> codigo) y caracteres invisibles (BOM)
              return header
                .toLowerCase()
                .trim()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/^\uFEFF/, '');
            },
            mapValues: ({ value }: any) =>
              typeof value === 'string' ? value.trim() : value,
          }),
        )
        .on('data', (fila: any) => resultados.push(fila))
        .on('end', async () => {
          let creadas = 0;
          let ignoradas = 0;

          // 👀 RADAR: Imprimimos la primera fila en la terminal para diagnosticar
          if (resultados.length > 0) {
            console.log(
              '👀 ATENCIÓN - Así lee la primera fila:',
              resultados[0],
            );
          }

          for (const fila of resultados) {
            // Verificamos que la fila tenga los datos mínimos vitales
            if (fila.identificacion && fila.codigo && fila.paralelo) {
              // Buscamos si este profesor ya tiene asignada esta materia exacta en este paralelo
              const asignacionExiste = await this.asignacionModel.findOne({
                identificacion: fila.identificacion,
                codigo: fila.codigo,
                materia: fila.materia,
                paralelo: fila.paralelo,
              });

              if (!asignacionExiste) {
                const nuevaAsignacion = new this.asignacionModel({
                  identificacion: fila.identificacion,
                  nombres_completos: fila.nombres_completos || '',
                  carrera: fila.carrera || '',
                  codigo: fila.codigo,
                  materia: fila.materia || '',
                  paralelo: fila.paralelo,
                });

                await nuevaAsignacion.save();
                creadas++;
              } else {
                ignoradas++;
              }
            }
          }

          resolve({
            mensaje: 'Proceso de materias completado exitosamente',
            totalFilasLeidas: resultados.length,
            nuevasAsignaciones: creadas,
            duplicadosIgnorados: ignoradas,
          });
        })
        .on('error', (error: any) => reject(error));
    });
  }

  // Función para buscar las materias de un docente específico
  async obtenerMateriasPorDocente(identificacion: string) {
    return await this.asignacionModel.find({ identificacion }).exec();
  }
}
