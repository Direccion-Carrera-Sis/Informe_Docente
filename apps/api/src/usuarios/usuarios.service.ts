/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Readable } from 'stream';
import { Usuario } from './usuario.schema';
import * as bcrypt from 'bcrypt';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const csv = require('csv-parser');

@Injectable()
export class UsuariosService implements OnModuleInit {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}

  async onModuleInit() {
    const adminExiste = await this.usuarioModel.findOne({ rol: 'admin' });

    if (!adminExiste) {
      // Creamos la contraseña por defecto: admin123
      const passwordEncriptado = await bcrypt.hash('admin123', 10);

      const adminDefault = new this.usuarioModel({
        correo: 'admin@uce.edu.ec',
        password: passwordEncriptado,
        rol: 'admin',
        cedula: '0000000000',
        nombres_completos: 'Administrador del Sistema',
        periodo_academico: '2026-2026',
      });

      await adminDefault.save();
      console.log(
        '✅ Cuenta de administrador creada exitosamente. Correo: admin@uce.edu.ec | Clave: admin123',
      );
    }
  }

  async cargarUsuariosDesdeCsv(file: any): Promise<any> {
    const resultados: any[] = [];
    const stream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(
          csv({
            separator: ';',
            mapHeaders: ({ header }: any) =>
              header
                .toLowerCase()
                .trim()
                .replace(/^\uFEFF/, ''),
            mapValues: ({ value }: any) =>
              typeof value === 'string' ? value.trim() : value,
          }),
        )
        .on('data', (fila: any) => resultados.push(fila))
        .on('end', async () => {
          let creados = 0;
          let actualizados = 0; // Agregamos un contador para los actualizados

          for (const fila of resultados) {
            if (fila.correo && fila.cedula) {
              const usuarioExiste = await this.usuarioModel.findOne({
                correo: fila.correo,
              });

              if (!usuarioExiste) {
                // ESCENARIO 2: Es un docente nuevo, lo creamos
                const passwordEncriptado = await bcrypt.hash(fila.cedula, 10);

                const nuevoUsuario = new this.usuarioModel({
                  correo: fila.correo,
                  password: passwordEncriptado,
                  rol: fila.rol || 'docente',
                  cedula: fila.cedula,
                  nombres_completos: fila.nombres_completos || '',
                  periodo_academico: fila.periodo_academico || '',
                });

                await nuevoUsuario.save();
                creados++;
              } else {
                // ESCENARIO 1: Ya existe, actualizamos su información (sin tocar su contraseña)
                usuarioExiste.periodo_academico =
                  fila.periodo_academico || usuarioExiste.periodo_academico;
                usuarioExiste.nombres_completos =
                  fila.nombres_completos || usuarioExiste.nombres_completos;
                usuarioExiste.rol = fila.rol || usuarioExiste.rol;

                await usuarioExiste.save();
                actualizados++;
              }
            }
          }

          resolve({
            mensaje: 'Proceso de usuarios completado exitosamente',
            totalLeidos: resultados.length,
            nuevosCreados: creados,
            docentesActualizados: actualizados,
          });
        })
        .on('error', (error: any) => reject(error));
    });
  }

  async buscarPorCorreo(correo: string) {
    return this.usuarioModel.findOne({ correo });
  }
}
