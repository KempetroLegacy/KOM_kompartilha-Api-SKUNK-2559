import { Controller, Get, Query, Redirect, Injectable, Body, Post, NotFoundException, UnauthorizedException, Headers } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { access } from 'fs';
import { UsuarioService } from 'src/api/services/usuario.service';
import { User } from '../domain/entities/userRelations-entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Gerenciamento de Autenticação')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly usuarioService: UsuarioService,) { }

  @Get('login')
  @Redirect()
  async login() {
    try {
      const url = await this.authService.getAuthCodeUrl();
      return { url };
    } catch (error) {
      console.error('Erro ao redirecionar para login:', error);
      throw error;
    }
  }

  @Get("login-url")
  async getLoginUrl() {
    const authUrl = await this.authService.getAuthCodeUrl();
    return { authUrl };
  }

  @Get("callback")
  async callback(@Query("code") code: string): Promise<{ accessToken: string, jwtToken: string, name: string, email: string }> {
    console.log("🔥 [BACKEND] Código recebido:", code); // 🔥 Log para verificar se o código chegou
      try {
          console.log("[BACKEND] Callback recebido, código:", code);
          
          if (!code) throw new Error("Código de autorização não fornecido!");
          
          const { accessToken, jwtToken, name, email } = await this.authService.acquireTokenByCode(code);
          
          return { accessToken, jwtToken, name, email };
      } catch (error) {
          console.error("[BACKEND] Erro no callback:", error);
          throw error;
      }
  }
  
  

  @Get('/me')
  async getMe(@Headers('Authorization') authHeader: string): Promise<User> {
    if (!authHeader) throw new UnauthorizedException("Token não fornecido");

    const jwtToken = authHeader.replace("Bearer ", "");
    const user = await this.authService.getUserFromToken(jwtToken);

    if (!user) throw new UnauthorizedException("Token inválido ou usuário não encontrado");

    return user;
  }


  //TESTE COM O TOKEN GENERICO
  @Post('token')
  async token(@Body() userData: any) {
    const usuario = await this.usuarioService.findByEmail(userData.email);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    const token = await this.authService.generateUserToken(usuario);
    return { accessToken: token };
  }
}
