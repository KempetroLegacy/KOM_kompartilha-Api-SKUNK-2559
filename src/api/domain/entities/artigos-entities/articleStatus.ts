import { Entity } from "typeorm";
import { Article } from "./articleBase.entity"; 

@Entity("articles_draft")
export class ArticleDraft extends Article {}

@Entity("articles_archived")
export class ArticleArchived extends Article {}
