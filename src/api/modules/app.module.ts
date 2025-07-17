import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "src/api/controllers/app.controller";
import { AppService } from "src/api/services/app.service";
import { User } from "src/api/domain/entities/userRelations-entities/user.entity";
import { Article } from "src/api/domain/entities/artigos-entities/articleBase.entity";
import { UsuarioModule } from "./usuario.module";
import { ArtigoModule } from "./artigo.module";
import {
  ArticleMember,
  ArticleTag,
} from "src/api/domain/entities/artigos-entities/article-relations.entities";
import { ScheduleModule } from "@nestjs/schedule";
import { UploadModule } from "./upload.module";
import { AuthController } from "src/api/controllers/auth.controller";
import { AuthService } from "src/api/services/auth.service";
import { UsuarioService } from "src/api/services/usuario.service";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./auth.module";
import { TagModule } from "./tag.module";
import { TagService } from "src/api/services/tag.service";
import { ProjetoModule } from "./projeto.module";
import { Project } from "../domain/entities/projeto-entities/projectBase.entity";
import { ProjectArchived, ProjectDraft } from "../domain/entities/projeto-entities/projectStatus";
import { ProjectMember, ProjectTag } from "../domain/entities/projeto-entities/project-relations.entities";
import { ProjectDraftTag } from "../domain/entities/projeto-entities/project-draft-relations.entities";
import { Tag } from "../domain/entities/userRelations-entities/tags.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    UsuarioModule,
    ArtigoModule,
    ProjetoModule,
    UploadModule,
    AuthModule,
    TagModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "default",
      signOptions: { expiresIn: "24h" },
    }),
    //   TypeOrmModule.forRoot({
    //     type: 'postgres',
    //     host: process.env.DB_HOST,
    //     port: parseInt(process.env.DB_PORT ?? '5432'),
    //     username: process.env.DB_USER,
    //     password: process.env.DB_PASS,
    //     database: process.env.DB_NAME,
    //     entities: [User, Article, Project, ArticleMember, ProjectMember, Tag, ArticleTag, ProjectTag, ProjectDraft, ProjectArchived],
    //     autoLoadEntities: true,
    //     synchronize: true,
    //     logging: false,
    //   }),
    // ],
    TypeOrmModule.forRoot({
      type: "mssql",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? "1433"),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [
        User,
        Article,
        ArticleMember,
        ArticleTag,
        Project,
        ProjectDraft,
        ProjectArchived,
        ProjectTag,
        ProjectDraftTag,
        ProjectMember,
        Tag,
      ],
      autoLoadEntities: true,
      synchronize: true, 
      logging: false,
      options: {
        encrypt: process.env.DB_ENCRYPT === "true", 
      },
      entityPrefix: process.env.DB_ENTITY_PREFIX || "kompartilha_",
    }),
    TypeOrmModule.forFeature([]), 
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, UsuarioService],
})
export class AppModule implements NestModule {
  constructor(private readonly tagService: TagService) {
    this.tagService
      .seedDefaultTags()
      .then(() => {
        console.log("✅ Tags fixas populadas!");
      })
      .catch((err) => {
        console.error("Erro ao popular tags fixas:", err);
      });
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes("*");
  }
}
