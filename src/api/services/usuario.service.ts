import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/api/domain/entities/userRelations-entities/user.entity";
import { Repository } from "typeorm";
import { AuthService } from "./auth.service";
import { UploadService } from "./upload.service";

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(User)
    private readonly usuarioRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly uploadService: UploadService
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usuarioRepository.findOne({ where: { email } });
  }

  async findAll(page = 1, limit = 10) {
    const [usuarios, total] = await this.usuarioRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = usuarios.map((usuario) => {
      const jwtToken = this.authService.getJwtToken(usuario.email);

      console.log(
        "🔍 [BACKEND] Buscando JWT para:",
        usuario.email,
        "| Token encontrado:",
        jwtToken
      );

      return { ...usuario, jwtToken: jwtToken ?? "Token não disponível" };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<User> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException("Usuário não encontrado");
    }
    return usuario;
  }

  async create(usuario: User): Promise<User> {
    return this.usuarioRepository.save(usuario);
  }

  async update(id: number, usuario: Partial<User>): Promise<User> {
    const user = await this.usuarioRepository.findOneBy({ id });
    if (!user) throw new NotFoundException("Usuário não encontrado");

    if (usuario.image) {
      usuario.image = this.cleanImageFilename(usuario.image);
    }

    if (usuario.backgroundImage) {
      usuario.backgroundImage = this.cleanImageFilename(
        usuario.backgroundImage
      );
    }

    if (usuario.city !== undefined) {
      user.city = usuario.city;
    }
    if (usuario.birthDate !== undefined) {
      user.birthDate = usuario.birthDate
        ? new Date(usuario.birthDate as any)
        : null;
    }
    if (usuario.college !== undefined) {
      user.college = usuario.college;
    }

    const { id: _, ...updateData } = { ...user, ...usuario };

    await this.usuarioRepository.update(id, updateData);

    const updated = await this.usuarioRepository.findOneBy({ id });
    if (!updated) throw new NotFoundException("Usuário não encontrado");

    return updated;
  }

  private cleanImageFilename(imageInput: string): string {
    return imageInput.replace(/^\/+uploads\/+/, "").replace(/^\/+/, "");
  }

  async processUserImage(imageInput: string): Promise<string> {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";

    if (imageInput.startsWith("http")) {
      const filename = await this.uploadService.downloadImage(imageInput);
      return `${backendUrl}/upload/download/${filename}`;
    }
    const cleanFilename = this.cleanImageFilename(imageInput);
    return `${backendUrl}/upload/image/${cleanFilename}`;
  }

  async remove(id: number): Promise<void> {
    await this.usuarioRepository.delete(id);
  }
}
