import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/api/services/auth.service';

@Injectable()
export class VerifyToken implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  
  incremental_value: number = 0
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('Cookies:', request.cookies);

    let token: string | undefined = undefined;
    const authorizationHeader = request.headers['authorization'];
    if (authorizationHeader) {
      token = authorizationHeader.split(' ')[1];
    } else if (request.cookies?.accessToken) {
      token = request.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      const decoded = await this.authService.verifyToken(token);
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
