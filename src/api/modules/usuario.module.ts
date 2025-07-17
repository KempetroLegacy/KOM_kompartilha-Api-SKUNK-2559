import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsuarioService } from "../services/usuario.service";
import { UsuarioController } from "src/api/controllers/usuario.controller";
import { AuthModule } from "./auth.module";
import { UploadModule } from "./upload.module";
import { User } from "src/api/domain/entities/userRelations-entities/user.entity";
import { UploadService } from "src/api/services/upload.service";
import { AzureBlobService } from "../services/azure-blob.service";
import { Article } from "../domain/entities/artigos-entities/articleBase.entity";
import {
  ArticleArchived,
  ArticleDraft,
} from "../domain/entities/artigos-entities/articleStatus";
import { ArtigoService } from "../services/artigo.service";
import { ArticleTagsHelper } from "../services/helpers/article-tags.helper";
import { ArticleRepositoryHelper } from "../services/helpers/article-repository.helper";
import { ArticleTag } from "../domain/entities/artigos-entities/article-relations.entities";
import { Tag } from "../domain/entities/userRelations-entities/tags.entity";
import { Project } from "../domain/entities/projeto-entities/projectBase.entity";
import { ProjectArchived, ProjectDraft } from "../domain/entities/projeto-entities/projectStatus";
import { ProjectMember, ProjectTag } from "../domain/entities/projeto-entities/project-relations.entities";
import { ProjectDraftTag } from "../domain/entities/projeto-entities/project-draft-relations.entities";
import { ProjetoService } from "../services/projeto.service";
import { ProjectTagsHelper } from "../services/helpers/project-tags.helper";
import { ProjectDraftTagsHelper } from "../services/helpers/project-draft-tags.helper";
import { ProjectRepositoryHelper } from "../services/helpers/project-repository.helper";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Article, ArticleDraft, ArticleArchived, ArticleTag, Tag, Project, ProjectDraft, ProjectArchived, ProjectTag, ProjectDraftTag]),
    UploadModule,
    AuthModule,
  ],
  providers: [
    UsuarioService,
    UploadService,
    AzureBlobService,
    ArtigoService,
    ArticleTagsHelper,
    ArticleRepositoryHelper,
    ProjetoService,
    ProjectTagsHelper,
    ProjectDraftTagsHelper,
    ProjectRepositoryHelper,
    
  ],
  controllers: [UsuarioController],
  exports: [UsuarioService],
})
export class UsuarioModule {}
