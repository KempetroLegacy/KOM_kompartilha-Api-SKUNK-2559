import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ArticleTag } from 'src/api/domain/entities/artigos-entities/article-relations.entities';
import { Tag } from 'src/api/domain/entities/userRelations-entities/tags.entity';
import { Article } from 'src/api/domain/entities/artigos-entities/articleBase.entity';

@Injectable()
export class ArticleTagsHelper {
  constructor(
    @InjectRepository(ArticleTag)
    private readonly articleTagRepository: Repository<ArticleTag>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly dataSource: DataSource
  ) {}

  async saveArticleTags(article: Article, tagNames: string[]): Promise<void> {
    // Remove tags existentes
    await this.articleTagRepository.delete({ article: { id: article.id } });
    
    // Adiciona novas tags
    for (const tagName of tagNames) {
      let tag = await this.tagRepository.findOne({ where: { name: tagName } });
      if (!tag) {
        tag = await this.tagRepository.save(this.tagRepository.create({ name: tagName }));
      }
      await this.articleTagRepository.save(this.articleTagRepository.create({ article, tag }));
    }
  }

  async removeArticleTags(articleId: number): Promise<void> {
    await this.articleTagRepository.delete({ article: { id: articleId } });
  }
}
