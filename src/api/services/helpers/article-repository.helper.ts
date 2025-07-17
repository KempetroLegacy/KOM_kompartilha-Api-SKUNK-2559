import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from 'src/api/domain/entities/artigos-entities/articleBase.entity';
import { User } from 'src/api/domain/entities/userRelations-entities/user.entity';
import { ArticleDraft, ArticleArchived } from 'src/api/domain/entities/artigos-entities/articleStatus';
import { ErrorMessages } from 'src/api/middlewares/validateRequest';

@Injectable()
export class ArticleRepositoryHelper {
  constructor(
    @InjectRepository(Article)
    private readonly artigoRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly usuarioRepository: Repository<User>,
    @InjectRepository(ArticleDraft)
    private readonly articleDraftRepository: Repository<ArticleDraft>,
    @InjectRepository(ArticleArchived)
    private readonly articleArchivedRepository: Repository<ArticleArchived>
  ) {}

  async findArticleById(id: number, withRelations = true): Promise<Article> {
    const relations = withRelations ? ['author', 'articleTags', 'articleTags.tag'] : ['author'];
    
    const artigo = await this.artigoRepository.findOne({
      where: { id },
      relations,
    });
    
    if (!artigo) {
      throw new NotFoundException(ErrorMessages.ARTIGO_NAO_ENCONTRADO);
    }
    
    return artigo;
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.usuarioRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }

  async findDraftByTitle(title: string, userId: number): Promise<ArticleDraft | null> {
    return this.articleDraftRepository.findOne({
      where: { title, author: { id: userId } },
      relations: ['author'],
    });
  }

  async findDraftById(id: number): Promise<ArticleDraft> {
    const draft = await this.articleDraftRepository.findOne({
      where: { id },
      relations: ['author', 'articleTags', 'articleTags.tag'],
    });
    if (!draft) {
      throw new NotFoundException('Rascunho não encontrado.');
    }
    return draft;
  }

  async findArchivedById(id: number): Promise<ArticleArchived> {
    const archived = await this.articleArchivedRepository.findOne({
      where: { id },
    });
    if (!archived) {
      throw new NotFoundException('Artigo não encontrado na lixeira.');
    }
    return archived;
  }
}
