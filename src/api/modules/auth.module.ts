import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController } from 'src/api/controllers/auth.controller';
import { VerifyToken } from 'src/api/middlewares/authMiddleware'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/api/domain/entities/userRelations-entities/user.entity'; 
import { JwtModule } from '@nestjs/jwt';
import { UsuarioModule } from './usuario.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => UsuarioModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default_secret'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService, 
    VerifyToken, 
  ],
  controllers: [AuthController], 
  exports: [AuthService, VerifyToken, TypeOrmModule],
})
export class AuthModule {}
