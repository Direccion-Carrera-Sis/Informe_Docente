/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AsignacionesService } from './asignaciones.service';

@Controller('asignaciones')
export class AsignacionesController {
  // <-- ¡El "export" de esta línea es el que estaba pidiendo!
  constructor(private readonly asignacionesService: AsignacionesService) {}

  // Ruta para que el Admin suba el CSV
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async cargarAsignaciones(@UploadedFile() file: any) {
    return await this.asignacionesService.cargarAsignacionesDesdeCsv(file);
  }

  // Ruta para que el Docente vea solo sus materias asignadas
  @Get('docente/:identificacion')
  async obtenerDatosDocente(@Param('identificacion') identificacion: string) {
    return await this.asignacionesService.obtenerMateriasPorDocente(
      identificacion,
    );
  }
}
