import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from 'src/api/domain/entities/projeto-entities/projectBase.entity';
import { User } from 'src/api/domain/entities/userRelations-entities/user.entity';
import { ProjectDraft, ProjectArchived } from 'src/api/domain/entities/projeto-entities/projectStatus';
import { ErrorMessages } from 'src/api/middlewares/validateRequest';

@Injectable()
export class ProjectRepositoryHelper {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProjectDraft)
    private readonly projectDraftRepository: Repository<ProjectDraft>,
    @InjectRepository(ProjectArchived)
    private readonly projectArchivedRepository: Repository<ProjectArchived>
  ) {}

  async findProjectById(id: number, withRelations = true): Promise<Project> {
    const relations = withRelations ? ['author', 'projectTags', 'projectTags.tag'] : ['author'];
    
    const project = await this.projectRepository.findOne({
      where: { id },
      relations,
    });
    
    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJETO_NAO_ENCONTRADO ?? 'Projeto não encontrado.');
    }
    
    return project;
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }

  async findDraftByTitle(title: string, userId: number): Promise<ProjectDraft | null> {
    return this.projectDraftRepository.findOne({
      where: { title, author: { id: userId } },
      relations: ['author'],
    });
  }

  async findDraftById(id: number): Promise<ProjectDraft> {
    const draft = await this.projectDraftRepository.findOne({
      where: { id },
      relations: ['author', 'projectDraftTags', 'projectDraftTags.tag'],
    });
    if (!draft) {
      throw new NotFoundException('Rascunho de projeto não encontrado.');
    }
    return draft;
  }

  async findArchivedById(id: number): Promise<ProjectArchived> {
    const archived = await this.projectArchivedRepository.findOne({
      where: { id },
    });
    if (!archived) {
      throw new NotFoundException('Projeto não encontrado na lixeira.');
    }
    return archived;
  }
}