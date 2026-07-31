import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(correo: string, pass: string) {
    // 1. Buscamos si el correo existe
    const usuario = await this.usuariosService.buscarPorCorreo(correo);
    if (!usuario) {
      throw new UnauthorizedException(
        'El correo o la contraseña son incorrectos',
      );
    }

    // 2. Comparamos la contraseña ingresada con la encriptada en la base
    const esPasswordValido = await bcrypt.compare(pass, usuario.password);
    if (!esPasswordValido) {
      throw new UnauthorizedException(
        'El correo o la contraseña son incorrectos',
      );
    }

    // 3. Generamos el Token con los datos útiles del usuario
    const payload = {
      sub: usuario._id,
      correo: usuario.correo,
      rol: usuario.rol,
      nombres: usuario.nombres_completos,
      periodo: usuario.periodo_academico,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        nombres: usuario.nombres_completos,
        correo: usuario.correo,
        rol: usuario.rol,
        cedula: usuario.cedula,
      },
    };
  }
}
