import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProjetoDto } from "../domain/dtos/projetoDTO/projeto.dto";
import { ProjetoResponseDTO } from "../domain/dtos/projetoDTO/projeto.responseDTO";
import { ProjetoService } from "../services/projeto.service";
import { ErrorResponses } from "src/api/middlewares/validateRequest";
import { VerifyToken } from "src/api/middlewares/authMiddleware";
import { SwaggerProjeto } from "src/config/docs/projeto.swagger";
import { AutoDeleteService } from "src/api/services/auto-delete.service";
import { UserId } from "../../config/decorators/user.decorator";

@ApiBearerAuth("JWT-auth")
@ApiTags("Gerenciamento de Projetos")
@Controller("projeto")
export class ProjetoController {
  constructor(
    private readonly projetoService: ProjetoService,
    private readonly autoDeleteService: AutoDeleteService
  ) {}

  @Get("/drafts")
  @SwaggerProjeto.listarRascunhos()
  @UseGuards(VerifyToken)
  async listDrafts(
    @UserId() userId: number,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.projetoService.listDrafts(userId, page, limit);
  }

  @Get("/search")
  @SwaggerProjeto.buscarPorTermo()
  @ErrorResponses.BadRequest()
  async search(
    @Query("query") query: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    if (!query || query.trim() === "") {
      throw new BadRequestException("O parâmetro de busca 'query' é obrigatório.");
    }
    return this.projetoService.search(query, page, limit);
  }

  @Get()
  @SwaggerProjeto.listar()
  @ErrorResponses.InternalServerError()
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.projetoService.findAll(page, limit);
  }

  @Get(":id")
  @SwaggerProjeto.buscarPorId()
  @ErrorResponses.NotFound("Projeto")
  @ErrorResponses.BadRequest()
  async findOne(@Param("id") id: number): Promise<ProjetoResponseDTO> {
    return this.projetoService.findOne(id);
  }

  @Post()
  @ApiBearerAuth("JWT-auth")
  @SwaggerProjeto.criar()
  @ErrorResponses.Unauthorized()
  @ErrorResponses.BadRequest()
  @UseGuards(VerifyToken)
  @UseInterceptors(FileInterceptor("file"))
  async create(
    @Body("project") projectData: string,
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number
  ): Promise<ProjetoResponseDTO> {
    const projetoData = this.parseProjectData(projectData);
    return this.projetoService.create(projetoData, userId, file);
  }

  @Put(":id")
  @ApiBearerAuth("JWT-auth")
  @SwaggerProjeto.atualizar()
  @ErrorResponses.Unauthorized()
  @ErrorResponses.NotFound("Projeto")
  @ErrorResponses.BadRequest()
  @UseGuards(VerifyToken)
  @UseInterceptors(FileInterceptor("file"))
  async update(
    @Param("id") id: number,
    @Body("project") projectData: string,
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number
  ): Promise<ProjetoResponseDTO> {
    const parsedData = this.parseProjectData(projectData);
    return this.projetoService.update(id, parsedData, userId, file);
  }

  @Delete(":id")
  @SwaggerProjeto.remover()
  @ErrorResponses.Unauthorized()
  @ErrorResponses.NotFound("Projeto")
  @UseGuards(VerifyToken)
  async remove(@Param("id") id: number, @UserId() userId: number) {
    return this.projetoService.remove(id, userId);
  }

  // ==================== DRAFT ENDPOINTS ====================

  @Get("/draft/:id")
  @UseGuards(VerifyToken)
  async getDraftById(@Param("id") id: number) {
    return this.projetoService.getDraftById(id);
  }

  @Post("/draft")
  @UseGuards(VerifyToken)
  @UseInterceptors(FileInterceptor("file"))
  async createDraft(
    @Body("project") projectData: string,
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number
  ): Promise<ProjetoResponseDTO> {
    const projetoData = this.parseProjectData(projectData);
    console.log("🚀 ~ ProjetoController ~ projetoData:", projetoData);
    return this.projetoService.createDraft(projetoData, userId, file);
  }

  @Put("/draft/:id")
  @UseGuards(VerifyToken)
  @UseInterceptors(FileInterceptor("file"))
  async updateDraft(
    @Param("id") id: number,
    @Body("project") projectData: string,
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number
  ): Promise<ProjetoResponseDTO> {
    const projetoData = this.parseProjectData(projectData);
    return this.projetoService.updateDraft(id, projetoData, userId, file);
  }

  @Delete("/draft/:id")
  @UseGuards(VerifyToken)
  async deleteDraft(@Param("id") id: number, @UserId() userId: number) {
    return this.projetoService.deleteDraft(id, userId);
  }

  private parseProjectData(projectData: string): ProjetoDto {
    try {
      return JSON.parse(projectData);
    } catch (error) {
      throw new BadRequestException("Formato JSON inválido no campo 'project'");
    }
  }
}
