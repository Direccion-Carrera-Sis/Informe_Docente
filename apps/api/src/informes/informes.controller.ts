/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query, // 👈 Importamos Query
} from '@nestjs/common';
import { InformesService } from './informes.service';

@Controller('informes')
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  @Post()
  async crearInforme(@Body() datos: any) {
    console.log('✅ PETICIÓN RECIBIDA EN /informes');
    console.log('👤 Docente ID:', datos.docenteId);

    // Al crear, el servicio extraerá automáticamente el autor desde datos.docenteId
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    const usuarioEjecutorId = updateData.docenteId || 'Desconocido';
    return this.informesService.update(id, updateData, usuarioEjecutorId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('usuarioId') usuarioId: string) {
    return this.informesService.remove(id, usuarioId);
  }
}
