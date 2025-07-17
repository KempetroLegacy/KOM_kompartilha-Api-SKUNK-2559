import { Entity } from "typeorm";
import { Project } from "./projectBase.entity"; 

@Entity("projects_draft")
export class ProjectDraft extends Project {}

@Entity("projects_archived")
export class ProjectArchived extends Project {}