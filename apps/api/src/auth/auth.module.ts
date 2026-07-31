import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    UsuariosModule,
    JwtModule.register({
      secret: 'SECRETO_SISTEMA_UCE_2026', // La llave maestra para firmar los tokens
      signOptions: { expiresIn: '8h' }, // La sesión durará 8 horas
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
