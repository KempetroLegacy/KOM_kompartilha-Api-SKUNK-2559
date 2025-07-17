import { Entity, OneToMany } from "typeorm";
import { Project } from "./projectBase.entity"; 
import { ProjectDraftTag } from "./project-draft-relations.entities";

@Entity("projects_draft")
export class ProjectDraft extends Project {
  @OneToMany(() => ProjectDraftTag, (projectDraftTag) => projectDraftTag.project)
  projectDraftTags: ProjectDraftTag[];
}

@Entity("projects_archived")
export class ProjectArchived extends Project {}