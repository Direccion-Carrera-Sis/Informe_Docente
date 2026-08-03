/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Put,
  Param,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  // Inyectamos el servicio que ya programaste
  constructor(private readonly usuariosService: UsuariosService) {}

  // Creamos la ruta POST /usuarios/upload
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Atrapa el archivo con la llave 'file'
  async cargarUsuarios(@UploadedFile() file: any) {
    // Le pasamos el archivo a la lógica pesada del servicio
    return await this.usuariosService.cargarUsuariosDesdeCsv(file);
  }

  @Put('docente/:cedula/cambiar-clave')
  async cambiarClave(
    @Param('cedula') cedula: string,
    @Body() datosClave: { claveActual: string; nuevaClave: string },
  ) {
    return this.usuariosService.cambiarClave(cedula, datosClave);
  }
}
