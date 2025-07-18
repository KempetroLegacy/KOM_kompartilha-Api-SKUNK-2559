import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ProjectDraft } from './projectStatus';
import { Tag } from '../userRelations-entities/tags.entity'; 

@Entity('project_draft_tags')
export class ProjectDraftTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProjectDraft, (project) => project.projectDraftTags)
  project: ProjectDraft;

  @ManyToOne(() => Tag, (tag) => tag.projectDraftTags)
  tag: Tag;
}
