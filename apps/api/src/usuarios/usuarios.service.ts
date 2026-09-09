/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
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
      // 1. Leemos de Docker/Producción, si no existen, usamos los locales por defecto
      const correoAdmin = process.env.ADMIN_CORREO || 'admin@uce.edu.ec';
      const passwordAdmin = process.env.ADMIN_CLAVE || 'admin123';
      const cedulaAdmin = process.env.ADMIN_CEDULA || '0000000000';

      const passwordEncriptado = await bcrypt.hash(passwordAdmin, 10);

      const adminDefault = new this.usuarioModel({
        correo: correoAdmin,
        password: passwordEncriptado,
        rol: 'admin',
        cedula: cedulaAdmin,
        nombres_completos: 'Administrador del Sistema',
        periodo_academico: process.env.PERIODO_ACTUAL || '2026-2026',
      });

      await adminDefault.save();

      // 2. Nunca imprimimos la contraseña real en consola por seguridad en producción
      console.log(
        `✅ Cuenta de administrador creada exitosamente. Correo: ${correoAdmin}`,
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

  async cambiarClave(
    cedula: string,
    datosClave: { claveActual: string; nuevaClave: string },
  ) {
    // 1. Buscar al usuario en MongoDB por su cédula
    const usuario = await this.usuarioModel.findOne({ cedula }).exec();
    if (!usuario) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    // 2. Comparar la clave actual ingresada con la encriptada en la BD
    // OJO: Cambia "usuario.clave" por el nombre exacto de tu campo en BD (ej. usuario.password)
    const claveValida = await bcrypt.compare(
      datosClave.claveActual,
      usuario.password,
    );

    if (!claveValida) {
      throw new HttpException(
        'La contraseña actual es incorrecta',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 3. Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const claveEncriptada = await bcrypt.hash(datosClave.nuevaClave, salt);

    // 4. Guardar los cambios
    usuario.password = claveEncriptada; // OJO: Igual aquí, usa tu nombre de campo exacto
    await usuario.save();

    return { mensaje: 'Contraseña actualizada con éxito' };
  }
}
