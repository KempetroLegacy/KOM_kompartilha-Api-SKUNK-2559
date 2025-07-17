import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../userRelations-entities/user.entity'; 
import { Project } from './projectBase.entity';
import { Tag } from '../userRelations-entities/tags.entity'; 

@Entity('project_members')
export class ProjectMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.projectMembers)
  user: User;

  @ManyToOne(() => Project, (project) => project.members)
  project: Project;
}

@Entity('project_tags')
export class ProjectTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (project) => project.projectTags)
  project: Project;

  @ManyToOne(() => Tag, (tag) => tag.projectTags)
  tag: Tag;
}