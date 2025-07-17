import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Article } from "src/api/domain/entities/artigos-entities/articleBase.entity"; 
import { User } from "src/api/domain/entities/userRelations-entities/user.entity"; 
import { ArtigoService } from "../services/artigo.service";
import { ArtigoController } from "src/api/controllers/artigo.controller";
import { AuthModule } from "./auth.module";
import { AutoDeleteService } from "src/api/services/auto-delete.service";
import { ArticleArchived, ArticleDraft } from "src/api/domain/entities/artigos-entities/articleStatus";
import { AutoDeleteModule } from "./autoDelete.module";
import { UploadModule } from "./upload.module";
import { ArticleTag } from "src/api/domain/entities/artigos-entities/article-relations.entities";
import { Tag } from "src/api/domain/entities/userRelations-entities/tags.entity";
import { UploadService } from "../services/upload.service";
import { AzureBlobService } from "../services/azure-blob.service";
// Importar os helpers
import { ArticleTagsHelper } from "../services/helpers/article-tags.helper";
import { ArticleRepositoryHelper } from "../services/helpers/article-repository.helper";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Article, User, ArticleDraft, ArticleArchived, ArticleTag, Tag
    ]),
    UploadModule,
    AutoDeleteModule,
    AuthModule, 
  ],
  providers: [
    ArtigoService, 
    UploadService, 
    AzureBlobService,
    ArticleTagsHelper,
    ArticleRepositoryHelper
  ],
  controllers: [ArtigoController],
  exports: [ArtigoService],
})
export class ArtigoModule {}