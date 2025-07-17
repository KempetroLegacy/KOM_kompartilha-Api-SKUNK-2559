import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ArticleTag } from '../artigos-entities/article-relations.entities';
import { ProjectTag } from '../projeto-entities/project-relations.entities';
import { ProjectDraftTag } from '../projeto-entities/project-draft-relations.entities';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => ArticleTag, (articleTag) => articleTag.tag)
  articleTags: ArticleTag[];

  @OneToMany(() => ProjectTag, (projectTag) => projectTag.tag)
  projectTags: ProjectTag[];

  @OneToMany(() => ProjectDraftTag, (projectDraftTag) => projectDraftTag.tag)
  projectDraftTags: ProjectDraftTag[];
}