import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Project } from "src/api/domain/entities/projeto-entities/projectBase.entity";
import { ProjectDraft, ProjectArchived } from "src/api/domain/entities/projeto-entities/projectStatus";
import { ProjectTag, ProjectMember } from "src/api/domain/entities/projeto-entities/project-relations.entities";
import { User } from "src/api/domain/entities/userRelations-entities/user.entity";
import { Tag } from "src/api/domain/entities/userRelations-entities/tags.entity";
import { ProjetoService } from "../services/projeto.service";
import { ProjetoController } from "src/api/controllers/projeto.controller";
import { UploadModule } from "./upload.module";
import { AutoDeleteModule } from "./autoDelete.module";
import { AuthModule } from "./auth.module";
import { UploadService } from "../services/upload.service";
import { AzureBlobService } from "../services/azure-blob.service";
import { ProjectTagsHelper } from "../services/helpers/project-tags.helper";
import { ProjectRepositoryHelper } from "../services/helpers/project-repository.helper";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectDraft,
      ProjectArchived,
      ProjectTag,
      ProjectMember,
      User,
      Tag,
    ]),
    UploadModule,
    AutoDeleteModule,
    AuthModule,
  ],
  providers: [
    ProjetoService,
    UploadService,
    AzureBlobService,
    ProjectTagsHelper,
    ProjectRepositoryHelper,
  ],
  controllers: [ProjetoController],
  exports: [ProjetoService],
})
export class ProjetoModule {}