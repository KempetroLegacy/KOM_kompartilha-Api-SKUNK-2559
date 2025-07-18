import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProjectDraftTag } from 'src/api/domain/entities/projeto-entities/project-draft-relations.entities';
import { Tag } from 'src/api/domain/entities/userRelations-entities/tags.entity';
import { ProjectDraft } from 'src/api/domain/entities/projeto-entities/projectStatus';

@Injectable()
export class ProjectDraftTagsHelper {
  constructor(
    @InjectRepository(ProjectDraftTag)
    private readonly projectDraftTagRepository: Repository<ProjectDraftTag>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly dataSource: DataSource
  ) {}

  async saveProjectDraftTags(project: ProjectDraft, tagNames: string[]): Promise<void> {
    // Remove tags existentes
    await this.projectDraftTagRepository.delete({ project: { id: project.id } });
    
    // Adiciona novas tags
    for (const tagName of tagNames) {
      let tag = await this.tagRepository.findOne({ where: { name: tagName } });
      if (!tag) {
        tag = await this.tagRepository.save(this.tagRepository.create({ name: tagName }));
      }
      await this.projectDraftTagRepository.save(this.projectDraftTagRepository.create({ project, tag }));
    }
  }

  async removeProjectDraftTags(projectId: number): Promise<void> {
    await this.projectDraftTagRepository.delete({ project: { id: projectId } });
  }

  async getProjectDraftTags(projectId: number): Promise<string[]> {
    const projectDraftTags = await this.projectDraftTagRepository.find({
      where: { project: { id: projectId } },
      relations: ['tag']
    });
    
    return projectDraftTags.map(pt => pt.tag.name);
  }
}
