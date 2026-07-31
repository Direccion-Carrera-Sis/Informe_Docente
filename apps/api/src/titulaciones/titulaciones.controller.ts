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
import { TitulacionesService } from './titulaciones.service';

@Controller('titulaciones')
export class TitulacionesController {
  constructor(private readonly titulacionesService: TitulacionesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async cargarTitulaciones(@UploadedFile() file: any) {
    return await this.titulacionesService.cargarDesdeCsv(file);
  }

  @Get('docente/:identificacion')
  async obtenerDatosDocente(@Param('identificacion') identificacion: string) {
    return await this.titulacionesService.obtenerPorDocente(identificacion);
  }
}
