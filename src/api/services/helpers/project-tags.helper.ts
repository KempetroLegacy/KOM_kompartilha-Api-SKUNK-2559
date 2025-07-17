import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProjectTag } from 'src/api/domain/entities/projeto-entities/project-relations.entities';
import { Tag } from 'src/api/domain/entities/userRelations-entities/tags.entity';
import { Project } from 'src/api/domain/entities/projeto-entities/projectBase.entity';

@Injectable()
export class ProjectTagsHelper {
  constructor(
    @InjectRepository(ProjectTag)
    private readonly projectTagRepository: Repository<ProjectTag>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly dataSource: DataSource
  ) {}

  async saveProjectTags(project: Project, tagNames: string[]): Promise<void> {
    // Remove tags existentes
    await this.projectTagRepository.delete({ project: { id: project.id } });
    
    // Adiciona novas tags
    for (const tagName of tagNames) {
      let tag = await this.tagRepository.findOne({ where: { name: tagName } });
      if (!tag) {
        tag = await this.tagRepository.save(this.tagRepository.create({ name: tagName }));
      }
      await this.projectTagRepository.save(this.projectTagRepository.create({ project, tag }));
    }
  }

  async removeProjectTags(projectId: number): Promise<void> {
    await this.projectTagRepository.delete({ project: { id: projectId } });
  }
}