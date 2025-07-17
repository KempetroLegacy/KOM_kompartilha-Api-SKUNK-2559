import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Article } from "src/api/domain/entities/artigos-entities/articleBase.entity";
import { ArtigoDto } from "src/api/domain/dtos/artigoDTO/artigo.dto";
import { ArtigoResponseDTO } from "src/api/domain/dtos/artigoDTO/artigo.responseDTO";
import { ArtigoMapper } from "src/config/mappers/artigo.mapper";
import {
  ArticleArchived,
  ArticleDraft,
} from "src/api/domain/entities/artigos-entities/articleStatus";
import { UploadService } from "./upload.service";
import { ErrorMessages } from "src/api/middlewares/validateRequest";
import { ArtigoValidatorHelper } from "./helpers/article-validator.helper";
import { ArticleTagsHelper } from "./helpers/article-tags.helper";
import { ArticleRepositoryHelper } from "./helpers/article-repository.helper";

@Injectable()
export class ArtigoService {
  constructor(
    @InjectRepository(Article)
    private readonly artigoRepository: Repository<Article>,
    @InjectRepository(ArticleDraft)
    private readonly articleDraftRepository: Repository<ArticleDraft>,
    private readonly uploadService: UploadService,
    private readonly articleTagsHelper: ArticleTagsHelper,
    private readonly articleRepositoryHelper: ArticleRepositoryHelper
  ) {}

  async findAll(page = 1, limit = 10) {
    const [items, total] = await this.artigoRepository.findAndCount({
      relations: ["author", "articleTags", "articleTags.tag"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map(ArtigoMapper.toResponseDTO),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<ArtigoResponseDTO> {
    ArtigoValidatorHelper.validateId(id);
    const artigo = await this.articleRepositoryHelper.findArticleById(id);
    return ArtigoMapper.toResponseDTO(artigo);
  }

  async create(
    artigoData: ArtigoDto,
    userId: number,
    file?: Express.Multer.File
  ): Promise<ArtigoResponseDTO> {
    ArtigoValidatorHelper.validateRequiredFields(
      artigoData.title,
      artigoData.content
    );

    const [author, banner, contentObject] = await Promise.all([
      this.articleRepositoryHelper.findUserById(userId),
      file ? this.uploadService.handleFileUpload(file) : Promise.resolve(""),
      Promise.resolve(ArtigoValidatorHelper.parseContent(artigoData.content)),
    ]);

    if (artigoData.title) {
      const draft = await this.articleRepositoryHelper.findDraftByTitle(
        artigoData.title,
        userId
      );
      if (draft) {
        await this.articleDraftRepository.delete(draft.id);
      }
    }

    const artigo = this.artigoRepository.create({
      title: artigoData.title,
      content: contentObject,
      banner,
      author,
    });

    const savedArtigo = await this.artigoRepository.save(artigo);

    if (artigoData.tags?.length) {
      await this.articleTagsHelper.saveArticleTags(
        savedArtigo,
        artigoData.tags
      );
    }

    return ArtigoMapper.toResponseDTO(
      await this.articleRepositoryHelper.findArticleById(savedArtigo.id)
    );
  }

  async update(
    id: number,
    artigoData: Partial<ArtigoDto>,
    userId: number,
    file?: Express.Multer.File
  ): Promise<ArtigoResponseDTO> {
    const artigo = await this.articleRepositoryHelper.findArticleById(
      id,
      false
    );
    ArtigoValidatorHelper.validateOwnership(artigo, userId);

    const updates: Partial<Article> = { ...artigoData };

    if (file) updates.banner = await this.uploadService.handleFileUpload(file);
    if (artigoData.content)
      updates.content = ArtigoValidatorHelper.parseContent(artigoData.content);

    Object.assign(artigo, updates);
    const updatedArtigo = await this.artigoRepository.save(artigo);

    if (artigoData.tags) {
      await this.articleTagsHelper.saveArticleTags(
        updatedArtigo,
        artigoData.tags
      );
    }

    return ArtigoMapper.toResponseDTO(
      await this.articleRepositoryHelper.findArticleById(updatedArtigo.id)
    );
  }

  async remove(id: number, userId: number): Promise<void> {
    const artigo = await this.articleRepositoryHelper.findArticleById(
      id,
      false
    );
    ArtigoValidatorHelper.validateOwnership(artigo, userId);
    await this.articleTagsHelper.removeArticleTags(id);
    await this.artigoRepository.remove(artigo);
  }

  async createDraft(
    artigoData: ArtigoDto,
    userId: number,
    file?: Express.Multer.File
  ): Promise<ArtigoResponseDTO> {
    ArtigoValidatorHelper.validateRequiredFields(
      artigoData.title,
      artigoData.content
    );

    const author = await this.articleRepositoryHelper.findUserById(userId);
    const bannerUrl = file
      ? await this.uploadService.handleFileUpload(file)
      : artigoData.banner || "";

    console.log("📝 Salvando rascunho com banner:", bannerUrl);

    const draft = this.articleDraftRepository.create({
      title: artigoData.title,
      content: artigoData.content,
      banner: bannerUrl,
      author,
      authorId: author.id,
      status: "draft",
    });

    const savedDraft = await this.articleDraftRepository.save(draft);
    console.log("🚀 ~ ArtigoService ~ savedDraft:", savedDraft);

    if (artigoData.tags?.length) {
      await this.articleTagsHelper.saveArticleTags(savedDraft, artigoData.tags);
    }

    return ArtigoMapper.toResponseDTO(
      await this.articleRepositoryHelper.findDraftById(savedDraft.id)
    );
  }

  async saveDraft(
    id: number,
    artigoDraftData: Partial<ArtigoDto>,
    userId: number
  ): Promise<ArtigoResponseDTO> {
    let artigo = await this.artigoRepository.findOne({
      where: { id },
      relations: ["author"],
    });
    let isDraft = false;
    if (!artigo) {
      artigo = await this.articleDraftRepository.findOne({
        where: { id },
        relations: ["author"],
      });
      isDraft = true;
      if (!artigo) {
        throw new NotFoundException(ErrorMessages.ARTIGO_NAO_ENCONTRADO);
      }
    }
    ArtigoValidatorHelper.validateOwnership(artigo, userId);

    let draftExistente = await this.articleDraftRepository.findOne({
      where: { id },
    });
    if (draftExistente) {
      const updatedDraft = this.articleDraftRepository.merge(draftExistente, {
        ...artigo,
        ...artigoDraftData,
      });
      updatedDraft.status = "draft";
      await this.articleDraftRepository.save(updatedDraft);
      if (artigoDraftData.tags) {
        await this.articleTagsHelper.saveArticleTags(
          updatedDraft,
          artigoDraftData.tags
        );
      }
      return ArtigoMapper.toResponseDTO(
        await this.articleRepositoryHelper.findDraftById(updatedDraft.id)
      );
    } else {
      const artigoDraft = this.articleDraftRepository.create({
        ...artigo,
        ...artigoDraftData,
      });
      artigoDraft.status = "draft";
      await this.articleDraftRepository.save(artigoDraft);
      if (!isDraft) {
        await this.artigoRepository.delete(id);
      }
      if (artigoDraftData.tags) {
        await this.articleTagsHelper.saveArticleTags(
          artigoDraft,
          artigoDraftData.tags
        );
      }
      return ArtigoMapper.toResponseDTO(
        await this.articleRepositoryHelper.findDraftById(artigoDraft.id)
      );
    }
  }

  async updateDraft(
    id: number,
    artigoData: ArtigoDto,
    userId: number,
    file?: Express.Multer.File
  ): Promise<ArtigoResponseDTO> {
    // Busca o draft existente
    const existingDraft = await this.articleDraftRepository.findOne({
      where: { id },
      relations: ["author"],
    });

    if (!existingDraft) {
      throw new NotFoundException(ErrorMessages.ARTIGO_NAO_ENCONTRADO);
    }

    ArtigoValidatorHelper.validateOwnership(existingDraft, userId);

    const updates: Partial<ArticleDraft> = {
      title: artigoData.title,
      content: artigoData.content,
    };

    if (file) {
      updates.banner = await this.uploadService.handleFileUpload(file);
    }

    const updatedDraft = this.articleDraftRepository.merge(
      existingDraft,
      updates
    );
    const savedDraft = await this.articleDraftRepository.save(updatedDraft);

    if (artigoData.tags?.length) {
      await this.articleTagsHelper.saveArticleTags(savedDraft, artigoData.tags);
    }

    return ArtigoMapper.toResponseDTO(
      await this.articleRepositoryHelper.findDraftById(savedDraft.id)
    );
  }

  async listArtigosByUser(userId: number, page = 1, limit = 10) {
    const [items, total] = await this.artigoRepository.findAndCount({
      where: { author: { id: userId } },
      relations: ["author", "articleTags", "articleTags.tag"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items: items.map(ArtigoMapper.toResponseDTO),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listDraftsByUser(userId: number, page = 1, limit = 10) {
    const [items, total] = await this.articleDraftRepository.findAndCount({
      where: { author: { id: userId } },
      relations: ["author", "articleTags", "articleTags.tag"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    console.log("🚀 ~ ArtigoService ~ listDraftsByUser ~ drafts:", items);
    
    return {
      items: items.map(ArtigoMapper.toResponseDTO),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listDrafts(userId?: number, page = 1, limit = 10) {
    const whereCondition = userId ? { author: { id: userId } } : {};
    const [items, total] = await this.articleDraftRepository.findAndCount({
      where: whereCondition,
      relations: ["author", "articleTags", "articleTags.tag"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return {
      items: items.map(ArtigoMapper.toResponseDTO),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDraftById(id: number): Promise<ArticleDraft> {
    const draft = await this.articleRepositoryHelper.findDraftById(id);
    if (draft?.banner && !draft.banner.includes("?")) {
      draft.banner = this.uploadService.getBlobUrlWithSas(draft.banner);
    }
    return draft;
  }

  async deleteDraft(id: number, userId: number): Promise<void> {
    const draft = await this.articleRepositoryHelper.findDraftById(id);
    ArtigoValidatorHelper.validateOwnership(draft, userId);
    await this.articleDraftRepository.delete(id);
  }

  async permanentDelete(id: number, userId: number) {
    const artigo = await this.articleRepositoryHelper.findArticleById(
      id,
      false
    );
    ArtigoValidatorHelper.validateOwnership(artigo, userId);
    await this.articleTagsHelper.removeArticleTags(id);
    await this.artigoRepository.delete(id);
    return { success: true, message: `Artigo ${id} excluído permanentemente` };
  }

  async search(query: string, page = 1, limit = 10) {
    const queryBuilder = this.artigoRepository
      .createQueryBuilder("article")
      .leftJoinAndSelect("article.author", "author")
      .leftJoinAndSelect("article.articleTags", "articleTags")
      .leftJoinAndSelect("articleTags.tag", "tag")
      .where("LOWER(article.title) LIKE :query", { query: `%${query.toLowerCase()}%` })
      .orderBy("article.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    
    return {
      items: items.map(ArtigoMapper.toResponseDTO),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
