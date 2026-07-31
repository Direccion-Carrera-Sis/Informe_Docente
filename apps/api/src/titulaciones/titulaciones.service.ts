/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Readable } from 'stream';
import { Titulacion } from './titulacion.schema';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const csv = require('csv-parser');

@Injectable()
export class TitulacionesService {
  constructor(
    @InjectModel(Titulacion.name) private titulacionModel: Model<Titulacion>,
  ) {}

  async cargarDesdeCsv(file: any): Promise<any> {
    const resultados: any[] = [];
    const stream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(
          csv({
            separator: ';', // Asegúrate de guardar el CSV separado por punto y coma
            mapHeaders: ({ header }: any) => {
              // Transforma "TEMA DE TITULACIÓN" a "tema_de_titulacion"
              return header
                .toLowerCase()
                .trim()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/^\uFEFF/, '')
                .replace(/\s+/g, '_');
            },
            mapValues: ({ value }: any) =>
              typeof value === 'string' ? value.trim() : value,
          }),
        )
        .on('data', (fila: any) => resultados.push(fila))
        .on('end', async () => {
          let creadas = 0;
          let ignoradas = 0;

          if (resultados.length > 0) {
            console.log(
              '👀 LLAVES DETECTADAS EN EL CSv:',
              Object.keys(resultados[0]),
            );
            console.log('👀 PRIMERA FILA COMPLETA:', resultados[0]);
          }

          for (const fila of resultados) {
            // Imprimimos para ver qué valor toma cada campo clave
            console.log(
              'Evaluando fila - Cédula:',
              fila.identificacion_docente,
              '| Tema:',
              fila.tema_titulacion,
            );

            if (fila.identificacion_docente && fila.tema_titulacion) {
              const existe = await this.titulacionModel.findOne({
                identificacion_docente: fila.identificacion_docente,
                tema: fila.tema_titulacion,
              });

              if (!existe) {
                const nueva = new this.titulacionModel({
                  identificacion_docente: fila.identificacion_docente,
                  docente_nombre: fila.docente || '',
                  estudiante: fila.estudiante || '',
                  tema: fila.tema_titulacion,
                  carrera: fila.carrera || '',
                  mecanismo: fila.mecanismo || '',
                });

                await nueva.save();
                creadas++;
              } else {
                ignoradas++;
              }
            } else {
              console.log('⚠️ Fila ignorada por falta de datos clave.');
            }
          }

          resolve({
            mensaje: 'Proceso completado',
            totalFilasLeidas: resultados.length,
            nuevasTitulaciones: creadas,
            duplicadosIgnorados: ignoradas,
          });
        })
        .on('error', (error: any) => reject(error));
    });
  }

  async obtenerPorDocente(identificacion_docente: string) {
    return await this.titulacionModel.find({ identificacion_docente }).exec();
  }
}
