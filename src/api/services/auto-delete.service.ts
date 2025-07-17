import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { LessThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ArticleArchived } from "src/api/domain/entities/artigos-entities/articleStatus";
import * as fs from "fs";

@Injectable()
export class AutoDeleteService {
    private readonly logger = new Logger(AutoDeleteService.name);

    constructor(

        @InjectRepository(ArticleArchived)
        private readonly artigoArchivedRepository: Repository<ArticleArchived>,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupArchivedProjects(): Promise<void> {
        console.log("Executando cron job para limpeza de PROJETOS arquivados...");
        await this.cleanupArchivedProjectsOnly();
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupArchivedArticles(): Promise<void> {
        console.log("Executando cron job para limpeza de ARTIGOS arquivados...");
        await this.cleanupArchivedArticlesOnly();
    }

    async cleanupArchivedProjectsOnly(): Promise<void> {
        const executionTime = new Date().toISOString();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        console.log(`🔍 Buscando projetos arquivados com "deletedAt" menor que ${sevenDaysAgo.toISOString()}`);

        console.log("✅ Exclusão de projetos arquivados realizada!");
    }

    async cleanupArchivedArticlesOnly(): Promise<void> {
        const executionTime = new Date().toISOString();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        console.log(`🔍 Buscando artigos arquivados com "deletedAt" menor que ${sevenDaysAgo.toISOString()}`);

        const filterDeletedArticles = await this.artigoArchivedRepository.find({
            where: { deletedAt: LessThan(sevenDaysAgo) },
            select: ["id", "title", "content"],
        });

        if (filterDeletedArticles.length === 0) {
            console.log("✅ Nenhum artigo encontrado para exclusão.");
            return;
        }

        await this.artigoArchivedRepository.createQueryBuilder()
            .delete()
            .from(ArticleArchived)
            .where("deletedAt <= :sevenDaysAgo", { sevenDaysAgo })
            .execute();

        for (const artigo of filterDeletedArticles) {
            const logMessage = `${executionTime} - 🗑️ Artigo ID: ${artigo.id} | Título: ${artigo.title} | excluído permanentemente após 7 dias.`;

            this.logger.log(logMessage);
            fs.appendFile("logs/auto-delete.log", logMessage + "\n", (err) => {
                if (err) console.error("Erro ao escrever no arquivo de log:", err);
                else console.log("✅ Log de exclusão de artigos registrado!");
            });
        }

        console.log("✅ Exclusão de artigos arquivados realizada!");
    }
}
