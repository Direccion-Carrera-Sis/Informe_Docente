/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
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
}
