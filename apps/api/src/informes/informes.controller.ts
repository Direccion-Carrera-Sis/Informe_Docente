/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InformesService } from './informes.service';

@Controller('informes')
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  @Post()
  async crearInforme(@Body() datos: any) {
    console.log('✅ PETICIÓN RECIBIDA EN /informes');
    console.log('👤 Docente ID:', datos.docenteId);

    // Guardamos los datos directamente en MongoDB usando tu servicio
    return this.informesService.crear(datos);
  }

  @Get()
  async obtenerInformes() {
    return this.informesService.obtenerTodos();
  }

  // Ruta para el Docente (Trae solo los suyos)
  @Get('docente/:id')
  async obtenerInformesDelDocente(@Param('id') docenteId: string) {
    return this.informesService.obtenerPorDocente(docenteId);
  }
}
