import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { User } from "../domain/entities/userRelations-entities/user.entity";
import { VerifyToken } from "src/api/middlewares/authMiddleware";
import { UsuarioService } from "src/api/services/usuario.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsuarioDto } from "../domain/dtos/usuarioDTO/usuario.dto";
import { UploadService } from "../services/upload.service";
import { ArtigoService } from "../services/artigo.service";
import { ProjetoService } from "../services/projeto.service";

@ApiBearerAuth("JWT-auth")
@ApiTags("Gerenciamento de Usuários")
@UseGuards(VerifyToken)
@Controller("usuarios")
export class UsuarioController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly uploadService: UploadService,
    private readonly artigoService: ArtigoService,
    private readonly projetoService: ProjetoService
  ) {}

  @Get()
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.usuarioService.findAll(page, limit);
  }

  @Get("me")
  async getMe(@Req() req: any): Promise<User> {
    const userPayload = req.user;
    if (!userPayload || !userPayload.email) {
      throw new Error("Usuário não autenticado");
    }
    const user = await this.usuarioService.findByEmail(userPayload.email);
    if (!user) throw new Error("Usuário não encontrado");
    return user;
  }

  @Get("/artigos")
  async listArtigos(@Query("userId") userId: number, @Query("page") page: number = 1, @Query("limit") limit: number = 10) {
    return this.artigoService.listArtigosByUser(userId, page, limit);
  }

  

  @Get("/projetos")
  async listProjetos(
    @Query("userId") userId: number,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.projetoService.listProjetosByUser(userId, page, limit);
  }

  @Get(":id")
  async findOne(@Param("id") id: number): Promise<User> {
    return this.usuarioService.findOne(id);
  }

  @Post()
  async create(@Body() usuario: UsuarioDto): Promise<User> {
    return this.usuarioService.create(usuario as any);
  }

  @Put(":id/avatar")
  @UseInterceptors(FileInterceptor("image"))
  async updateAvatar(
    @Param("id") id: number,
    @UploadedFile() file: Express.Multer.File
  ): Promise<User> {
    if (!file) throw new Error("Nenhuma imagem enviada");
    const imageUrl = await this.uploadService.handleFileUpload(file);
    return this.usuarioService.update(id, { image: imageUrl });
  }

  @Put(":id/background")
  @UseInterceptors(FileInterceptor("image"))
  async updateBackground(
    @Param("id") id: number,
    @UploadedFile() file: Express.Multer.File
  ): Promise<User> {
    if (!file) throw new Error("Nenhuma imagem enviada");
    const backgroundUrl = await this.uploadService.handleFileUpload(file);
    return this.usuarioService.update(id, { backgroundImage: backgroundUrl });
  }

  @Put(":id")
  async update(
    @Param("id") id: number,
    @Body() usuario: UsuarioDto
  ): Promise<User> {
    console.log("Payload recebido no update de usuário:", usuario);
    return this.usuarioService.update(id, usuario as any);
  }

  @Delete(":id")
  async remove(@Param("id") id: number): Promise<void> {
    return this.usuarioService.remove(id);
  }
}
