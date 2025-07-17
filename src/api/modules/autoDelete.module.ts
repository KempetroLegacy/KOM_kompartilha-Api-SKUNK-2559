import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticleArchived } from "src/api/domain/entities/artigos-entities/articleStatus";
import { AutoDeleteService } from "src/api/services/auto-delete.service";

@Module({
    imports: [TypeOrmModule.forFeature([ArticleArchived])],
    providers: [AutoDeleteService],
    exports: [AutoDeleteService], 
})
export class AutoDeleteModule {}

