import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { UploadService } from "./upload.service";
import { ErrorMessages } from "src/api/middlewares/validateRequest";
import { Project } from "../domain/entities/projeto-entities/projectBase.entity";
import { ProjectArchived, ProjectDraft } from "../domain/entities/projeto-entities/projectStatus";
import { ProjetoResponseDTO } from "../domain/dtos/projetoDTO/projeto.responseDTO";
import { ProjetoDto } from "../domain/dtos/projetoDTO/projeto.dto";
import { ProjetoMapper } from "src/config/mappers/projeto.mapper";
import { ProjectValidatorHelper } from "./helpers/project-validator.helper";
import { ProjectTagsHelper } from "./helpers/project-tags.helper";
import { ProjectRepositoryHelper } from "./helpers/project-repository.helper";

@Injectable()
export class ProjetoService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectDraft)
    private readonly projectDraftRepository: Repository<ProjectDraft>,
    @InjectRepository(ProjectArchived)
    private readonly projectArchivedRepository: Repository<ProjectArchived>,
    private readonly uploadService: UploadService,
    private readonly dataSource: DataSource,
    private readonly projectTagsHelper: ProjectTagsHelper,
    private readonly projectRepositoryHelper: ProjectRepositoryHelper
  ) {}

  async findAll(): Promise<ProjetoResponseDTO[]> {
    const projetos = await this.projectRepository.find({
      relations: ["author", "projectTags", "projectTags.tag"],
      order: { createdAt: "DESC" },
    });

    return projetos.map(ProjetoMapper.toResponseDTO);
  }

  async findOne(id: number): Promise<ProjetoResponseDTO> {
    ProjectValidatorHelper.validateId(id);
    const projeto = await this.projectRepositoryHelper.findProjectById(id);
    return ProjetoMapper.toResponseDTO(projeto);
  }

  async create(
    projetoData: ProjetoDto,
    userId: number,
    file?: Express.Multer.File
  ): Promise<ProjetoResponseDTO> {
    console.log("🚀 ~ ProjetoService ~ projetoData:", projetoData)
    ProjectValidatorHelper.validateRequiredFields(
      projetoData.title,
      projetoData.content,
      projetoData.startDate,
      projetoData.endDate
    );

    const [author, banner, contentObject] = await Promise.all([
      this.projectRepositoryHelper.findUserById(userId),
      file ? this.uploadService.handleFileUpload(file) : Promise.resolve(""),
      Promise.resolve(ProjectValidatorHelper.parseContent(projetoData.content)),
    ]);

    if (projetoData.title) {
      const draft = await this.projectRepositoryHelper.findDraftByTitle(
        projetoData.title,
        userId
      );
      if (draft) {
        await this.projectDraftRepository.delete(draft.id);
      }
    }

    const projeto = this.projectRepository.create({
      title: projetoData.title,
      content: contentObject,
      banner,
      author,
      startDate: projetoData.startDate ? new Date(projetoData.startDate) : undefined,
      endDate: projetoData.endDate ? new Date(projetoData.endDate) : undefined,
    });

    const savedProjeto = await this.projectRepository.save(projeto);

    if (projetoData.tags?.length) {
      await this.projectTagsHelper.saveProjectTags(
        savedProjeto,
        projetoData.tags
      );
    }

    return ProjetoMapper.toResponseDTO(
      await this.projectRepositoryHelper.findProjectById(savedProjeto.id)
    );
  }

  async update(
    id: number,
    projetoData: Partial<ProjetoDto>,
    userId: number,
    file?: Express.Multer.File
  ): Promise<ProjetoResponseDTO> {
    console.log("🔄 ProjetoService.update - ID:", id);
    console.log("🔄 ProjetoService.update - Dados recebidos:", projetoData);
    
    const projeto = await this.projectRepositoryHelper.findProjectById(
      id,
      false
    );
    console.log("📖 ProjetoService.update - Projeto atual:", {
      id: projeto.id,
      title: projeto.title,
      startDate: projeto.startDate,
      endDate: projeto.endDate
    });
    
    ProjectValidatorHelper.validateOwnership(projeto, userId);

    const { startDate, endDate, content, ...otherFields } = projetoData;
    const updates: Partial<Project> = { ...otherFields };

    if (file) updates.banner = await this.uploadService.handleFileUpload(file);
    if (content)
      updates.content = ProjectValidatorHelper.parseContent(content);
    if (startDate)
      updates.startDate = new Date(startDate);
    if (endDate)
      updates.endDate = new Date(endDate);

    console.log("📝 ProjetoService.update - Updates a aplicar:", updates);
    
    Object.assign(projeto, updates);
    const updatedProjeto = await this.projectRepository.save(projeto);
    
    console.log("✅ ProjetoService.update - Projeto salvo:", {
      id: updatedProjeto.id,
      title: updatedProjeto.title,
      startDate: updatedProjeto.startDate,
      endDate: updatedProjeto.endDate
    });

    if (projetoData.tags) {
      await this.projectTagsHelper.saveProjectTags(
        updatedProjeto,
        projetoData.tags
      );
    }

    return ProjetoMapper.toResponseDTO(
      await this.projectRepositoryHelper.findProjectById(updatedProjeto.id)
    );
  }

  async remove(id: number, userId: number): Promise<void> {
    const projeto = await this.projectRepositoryHelper.findProjectById(
      id,
      false
    );
    ProjectValidatorHelper.validateOwnership(projeto, userId);
    await this.projectTagsHelper.removeProjectTags(id);
    await this.projectRepository.remove(projeto);
  }

  async createDraft(
    projetoData: ProjetoDto,
    userId: number,
    file?: Express.Multer.File
  ): Promise<ProjetoResponseDTO> {
    ProjectValidatorHelper.validateRequiredFields(
      projetoData.title,
      projetoData.content,
      projetoData.startDate,
      projetoData.endDate
    );

    const author = await this.projectRepositoryHelper.findUserById(userId);
    const bannerUrl = file
      ? await this.uploadService.handleFileUpload(file)
      : projetoData.banner || "";

    console.log("📝 Salvando rascunho com banner:", bannerUrl);

    const draft = this.projectDraftRepository.create({
      title: projetoData.title,
      content: projetoData.content,
      banner: bannerUrl,
      author,
      authorId: author.id,
      status: "draft",
      startDate: projetoData.startDate ? new Date(projetoData.startDate) : undefined,
      endDate: projetoData.endDate ? new Date(projetoData.endDate) : undefined,
    });

    const savedDraft = await this.projectDraftRepository.save(draft);
    console.log("🚀 ~ ProjetoService ~ savedDraft:", savedDraft)

    if (projetoData.tags?.length) {
      await this.projectTagsHelper.saveProjectTags(savedDraft, projetoData.tags);
    }

    return ProjetoMapper.toResponseDTO(
      await this.projectRepositoryHelper.findDraftById(savedDraft.id)
    );
  }


  async saveDraft(
    id: number,
    projetoDraftData: Partial<ProjetoDto>,
    userId: number
  ): Promise<ProjetoResponseDTO> {
    let projeto = await this.projectRepository.findOne({
      where: { id },
      relations: ["author"],
    });
    let isDraft = false;
    if (!projeto) {
      projeto = await this.projectDraftRepository.findOne({
        where: { id },
        relations: ["author"],
      });
      isDraft = true;
      if (!projeto) {
        throw new NotFoundException(ErrorMessages.PROJETO_NAO_ENCONTRADO);
      }
    }
    ProjectValidatorHelper.validateOwnership(projeto, userId);

    let draftExistente = await this.projectDraftRepository.findOne({
      where: { id },
    });
    if (draftExistente) {
      const updatedDraft = this.projectDraftRepository.merge(draftExistente, {
        ...projeto,
        ...projetoDraftData,
      });
      updatedDraft.status = "draft";
      await this.projectDraftRepository.save(updatedDraft);
      if (projetoDraftData.tags) {
        await this.projectTagsHelper.saveProjectTags(
          updatedDraft,
          projetoDraftData.tags
        );
      }
      return ProjetoMapper.toResponseDTO(
        await this.projectRepositoryHelper.findDraftById(updatedDraft.id)
      );
    } else {
      const projetoDraft = this.projectDraftRepository.create({
        ...projeto,
        ...projetoDraftData,
      });
      projetoDraft.status = "draft";
      await this.projectDraftRepository.save(projetoDraft);
      if (!isDraft) {
        await this.projectRepository.delete(id);
      }
      if (projetoDraftData.tags) {
        await this.projectTagsHelper.saveProjectTags(
          projetoDraft,
          projetoDraftData.tags
        );
      }
      return ProjetoMapper.toResponseDTO(
        await this.projectRepositoryHelper.findDraftById(projetoDraft.id)
      );
    }
  }

    async listProjetosByUser(userId: number): Promise<ProjetoResponseDTO[]> {
      const projetos = await this.projectRepository.find({
        where: { author: { id: userId } },
        relations: ["author", "projectTags"],
        order: { createdAt: "DESC" },
      });
      return projetos.map(ProjetoMapper.toResponseDTO);
    }

  async updateDraft(
  id: number,
  projetoData: ProjetoDto,
  userId: number,
  file?: Express.Multer.File
): Promise<ProjetoResponseDTO> {
  // Busca o draft existente
  const existingDraft = await this.projectDraftRepository.findOne({
    where: { id },
    relations: ["author"],
  });

  if (!existingDraft) {
    throw new NotFoundException(ErrorMessages.PROJETO_NAO_ENCONTRADO);
  }

  // Valida se o usuário é o dono do draft
  ProjectValidatorHelper.validateOwnership(existingDraft, userId);

  // Prepara as atualizações
  const updates: Partial<ProjectDraft> = {
    title: projetoData.title,
    content: projetoData.content,
    startDate: projetoData.startDate ? new Date(projetoData.startDate) : undefined,
    endDate: projetoData.endDate ? new Date(projetoData.endDate) : undefined,
  };

  // Processa o upload da imagem se houver
  if (file) {
    updates.banner = await this.uploadService.handleFileUpload(file);
  }

  // Atualiza o draft
  const updatedDraft = this.projectDraftRepository.merge(existingDraft, updates);
  const savedDraft = await this.projectDraftRepository.save(updatedDraft);

  // Atualiza as tags se fornecidas
  if (projetoData.tags?.length) {
    await this.projectTagsHelper.saveProjectTags(savedDraft, projetoData.tags);
  }

  // Retorna o draft atualizado
  return ProjetoMapper.toResponseDTO(
    await this.projectRepositoryHelper.findDraftById(savedDraft.id)
  );
}

async listDrafts(userId?: number): Promise<ProjetoResponseDTO[]> {
  const whereCondition = userId ? { author: { id: userId } } : {};
  const drafts = await this.projectDraftRepository.find({
    where: whereCondition,
    relations: ["author", "projectTags", "projectTags.tag"],
    order: { createdAt: "DESC" },
  });
  return drafts.map(ProjetoMapper.toResponseDTO);
}

  async getDraftById(id: number): Promise<ProjectDraft> {
    const draft = await this.projectRepositoryHelper.findDraftById(id);
    if (draft?.banner && !draft.banner.includes("?")) {
      draft.banner = this.uploadService.getBlobUrlWithSas(draft.banner);
    }
    return draft;
  }

  async deleteDraft(id: number, userId: number): Promise<void> {
    const draft = await this.projectRepositoryHelper.findDraftById(id);
    ProjectValidatorHelper.validateOwnership(draft, userId);
    await this.projectDraftRepository.delete(id);
  }

  async permanentDelete(id: number, userId: number) {
    const projeto = await this.projectRepositoryHelper.findProjectById(
      id,
      false
    );
    ProjectValidatorHelper.validateOwnership(projeto, userId);
    await this.projectTagsHelper.removeProjectTags(id);
    await this.projectRepository.delete(id);
    return { success: true, message: `Projeto ${id} excluído permanentemente` };
  }

  async search(query: string): Promise<ProjetoResponseDTO[]> {
    const projetos = await this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.author", "author")
      .leftJoinAndSelect("project.projectTags", "projectTags")
      .leftJoinAndSelect("projectTags.tag", "tag")
      .where("project.title LIKE :query OR project.content LIKE :query", { query: `%${query}%` })
      .orderBy("project.createdAt", "DESC")
      .getMany();
    return projetos.map(ProjetoMapper.toResponseDTO);
  }
}
