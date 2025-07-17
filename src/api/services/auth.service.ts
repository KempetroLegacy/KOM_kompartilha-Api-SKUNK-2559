import { Injectable } from '@nestjs/common';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { Repository } from 'typeorm';
import { User } from 'src/api/domain/entities/userRelations-entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly userTokens = new Map<string, string>();
  private readonly msalInstance: ConfidentialClientApplication;
  private readonly frontendRedirectUri: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private readonly usuarioRepository: Repository<User>,
  ) {
    this.frontendRedirectUri = process.env.FRONTEND_REDIRECT_URI || 'http://localhost:3000/auth/callback';
    const clientId = process.env.AZURE_CLIENT_ID;
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    if (!clientId || !tenantId || !clientSecret) {
      throw new Error('Azure AD environment variables are missing');
    }

    const msalConfig = {
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        clientSecret,
      },
    };

    this.msalInstance = new ConfidentialClientApplication(msalConfig);
  }

  async getAuthCodeUrl(): Promise<string> {
    const authCodeUrlParams = {
      scopes: ['User.Read'],
      redirectUri: this.frontendRedirectUri,
      prompt: 'login',
    };

    try {
      return await this.msalInstance.getAuthCodeUrl(authCodeUrlParams);
    } catch (error) {
      console.error('Erro ao gerar URL de autenticação:', error);
      throw error;
    }
  }

  storeJwtToken(email: string, jwtToken: string) {
    console.log("[BACKEND] Armazenando JWT para usuário:", email);
    this.userTokens.set(email, jwtToken);
  }


  getJwtToken(email: string): string {
    return this.userTokens.get(email) || "Token não disponível";
  }

  async acquireTokenByCode(code: string): Promise<{ accessToken: string; jwtToken: string; name: string; email: string }> {
    try {
        console.log("[BACKEND] Iniciando acquireTokenByCode com código:", code);
        
        const tokenRequest = { scopes: ['User.Read', 'openid', 'profile', 'offline_access'], redirectUri: this.frontendRedirectUri, code };
        const response = await this.msalInstance.acquireTokenByCode(tokenRequest);

        const accessToken = response.accessToken;
        const name = response.account?.name || 'Nome Indefinido';
        const email = response.account?.username || 'Email Indefinido';

        if (!name || !email) throw new Error('Não foi possível obter as credenciais do usuário.');

    
        let usuario: User | null = await this.usuarioRepository.findOne({ where: { email } });

        if (!usuario) {
          console.log("[BACKEND] Usuário não encontrado, criando...");
          usuario = await this.verifyAndSaveUser(name, email, '') as User;
      }      
        
      
        let jwtToken = this.getJwtToken(usuario.email);
        const decodedToken = jwtToken !== "Token não disponível" ? this.jwtService.decode(jwtToken) : null;

        if (!jwtToken || !decodedToken || decodedToken.exp * 1000 < Date.now()) {
            console.log("[BACKEND] Token expirado ou inexistente, gerando novo JWT...");
            jwtToken = await this.generateUserToken(usuario);
            this.storeJwtToken(usuario.email, jwtToken);
        } else {
            console.log("[BACKEND] Token existente e válido, reutilizando JWT:", jwtToken);
        }

        return { accessToken, jwtToken, name, email };
    } catch (error) {
        console.error('Erro ao adquirir token:', error);
        throw error;
    }
}


async validateToken(token: string): Promise<boolean> {
  try {
    console.log("🔍 [BACKEND] Validando token:", token);
    const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'default_secret' });
    console.log("✅ [BACKEND] Payload decodificado:", decoded);
    
    const userId = Number(decoded.id);
    console.log("User id convertido:", userId);
    
    if (isNaN(userId)) {
      throw new Error("O id extraído do token não é um número válido");
    }
    
    return true;
  } catch (error) {
    console.error("❌ [BACKEND] Erro ao validar token:", error);
    return false;
  }
}




  async verifyAndSaveUser(name: string, email: string, image: string) {
    console.log("🚀 ~ AuthService ~ verifyAndSaveUser ~ email:", email)
    if (!email || !name) {
      console.error('[ KOMPARTILHA ]: O nome e e-mail são obrigatórios!');
      return;
    }


    const usuarioRegistrado = await this.usuarioRepository.findOne({ where: { email: email } });

    if (usuarioRegistrado) {
      console.log('[ KOMPARTILHA ]: O usuário já existe no sistema. Não será criado novamente.');
      return usuarioRegistrado;
    }


    const usuarioNovo = this.usuarioRepository.create({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      image: image || 'Foto-Padrão.png',
      bio: '',
      description: '',
      typeUser: 'colaborador',
    });

    await this.usuarioRepository.save(usuarioNovo);
    console.log('[ KOMPARTILHA ]: O usuário foi criado com sucesso!', usuarioNovo);

    return usuarioNovo;

  }

  async generateUserToken(user: User): Promise<string> {
    console.log("[BACKEND] Gerando JWT para usuário:", user.email);

    const payload = {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      typeUser: user.typeUser,
    };

    console.log("[BACKEND] Payload do JWT:", payload);

    const jwtToken = this.jwtService.sign(payload, { expiresIn: '24h' });
    console.log("[BACKEND] JWT Gerado com sucesso:", jwtToken);

    return jwtToken;
  }



  async verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  async getUserFromToken(jwtToken: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(jwtToken);
      return await this.usuarioRepository.findOne({ where: { email: payload.email } });
    } catch (error) {
      console.error("Erro ao validar token:", error);
      return null;
    }
  }
}
