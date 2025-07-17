import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  Query,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { ArtigoDto } from "../domain/dtos/artigoDTO/artigo.dto";
import { ArtigoResponseDTO } from "../domain/dtos/artigoDTO/artigo.responseDTO";
import { ArtigoService } from "../services/artigo.service";
import { ErrorResponses } from "src/api/middlewares/validateRequest";
import { VerifyToken } from "src/api/middlewares/authMiddleware";
import { SwaggerArtigo } from "src/config/docs/artigo.swagger";
import { AutoDeleteService } from "src/api/services/auto-delete.service";
import { UserId } from "../../config/decorators/user.decorator";

@ApiBearerAuth("JWT-auth")
@ApiTags("Gerenciamento de Artigos")
@Controller("artigo")
export class ArtigoController {
  constructor(
    private readonly artigoService: ArtigoService,
    private readonly autoDeleteService: AutoDeleteService
  ) {}

  @Get("/drafts")
  @SwaggerArtigo.listarRascunhos()
  @UseGuards(VerifyToken)
  async listDrafts(@UserId() userId: number) {
    return this.artigoService.listDrafts(userId);
  }

  @Get("/search")
  @SwaggerArtigo.buscarPorTermo()
  @ErrorResponses.BadRequest()
  async search(@Query("query") query: string): Promise<ArtigoResponseDTO[]> {
    if (!query || query.trim() === "") {
      throw new BadRequestException(
        "O parâmetro de busca 'query' é obrigatório."
      );
    }
    return this.artigoService.search(query);
  }

  @Get()
  @SwaggerArtigo.listar()
  @ErrorResponses.InternalServerError()
  async findAll(): Promise<ArtigoResponseDTO[]> {
    return this.artigoService.findAll();
  }

  @Get(":id")
  @SwaggerArtigo.buscarPorId()
  @ErrorResponses.NotFound("Artigo")
  @ErrorResponses.BadRequest()
  async findOne(@Param("id") id: number): Promise<ArtigoResponseDTO> {
    return this.artigoService.findOne(id);
  }

  @Post()
  @ApiBearerAuth("JWT-auth")
  @SwaggerArtigo.criar()
  @ErrorResponses.Unauthorized()
  @ErrorResponses.BadRequest()
  @UseGuards(VerifyToken)
  @UseInterceptors(FileInterceptor("file"))
  async create(
    @Body("article") articleData: string,
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number
  ): Promise<ArtigoResponseDTO> {
    const artigoData = this.parseArticleData(articleData);
    return this.artigoService.create(artigoData, userId, file);
  }

  @Put(":id")
  @ApiBearerAuth("JWT-auth")
  @SwaggerArtigo.atualizar()
  @ErrorResponses.Unauthorized()
  @ErrorResponses.NotFound("Artigo")
  @ErrorResponses.BadRequest()
  @UseGuards(VerifyToken)
  @UseInterceptors(FileInterceptor("file"))
  async update(
    @Param("id") id: number,
    @Body("article") articleData: string,
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number
  ): Promise<ArtigoResponseDTO> {
    const parsedData = this.parseArticleData(articleData);
    return this.artigoService.update(id, parsedData, userId, file);
  }

  @Delete(":id")
  @SwaggerArtigo.remover()
  @ErrorResponses.Unauthorized()
  @ErrorResponses.NotFound("Artigo")
  @UseGuards(VerifyToken)
  async remove(@Param("id") id: number, @UserId() userId: number) {
    return this.artigoService.remove(id, userId);
  }

  // ==================== DRAFT ENDPOINTS ====================

  @Get("/draft/:id")
  @UseGuards(VerifyToken)
  async getDraftById(@Param("id") id: number) {
    console.log("🚀 ~ ArtigoController ~ getDraftById ~ id:", id);
    return this.artigoService.getDraftById(id);
  }

  @Post("/draft")
  @UseGuards(VerifyToken)
  @UseInterceptors(FileInterceptor("file"))
  async createDraft(
    @Body("article") articleData: string,
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number
  ): Promise<ArtigoResponseDTO> {
    const artigoData = this.parseArticleData(articleData);
    console.log("🚀 ~ ArtigoController ~ artigoData:", artigoData);
    console.log("🚀 ~ ArtigoController ~ artigoData:", artigoData);
    return this.artigoService.createDraft(artigoData, userId, file);
  }

  @Put("/draft/:id")
  @UseGuards(VerifyToken)
  @UseInterceptors(FileInterceptor("file"))
  async updateDraft(
    @Param("id") id: number,
    @Body("article") articleData: string,
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number
  ): Promise<ArtigoResponseDTO> {
    const artigoData = this.parseArticleData(articleData);
    console.log("🚀 ~ ArtigoController ~ updateDraft ~ id:", id);
    console.log(
      "🚀 ~ ArtigoController ~ updateDraft ~ artigoData:",
      artigoData
    );
    return this.artigoService.updateDraft(id, artigoData, userId, file);
  }

  @Delete("/draft/:id")
  @UseGuards(VerifyToken)
  async deleteDraft(@Param("id") id: number, @UserId() userId: number) {
    return this.artigoService.deleteDraft(id, userId);
  }

  private parseArticleData(articleData: string): ArtigoDto {
    try {
      return JSON.parse(articleData);
    } catch (error) {
      throw new BadRequestException("Formato JSON inválido no campo 'article'");
    }
  }
}
