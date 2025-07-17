import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../userRelations-entities/user.entity'; 
import { Article } from './articleBase.entity';
import { Tag } from '../userRelations-entities/tags.entity'; 

@Entity('article_members')
export class ArticleMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.articleMembers)
  user: User;

  @ManyToOne(() => Article, (article) => article.members)
  article: Article;
}

@Entity('article_tags')
export class ArticleTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Article, (article) => article.articleTags)
  article: Article;

  @ManyToOne(() => Tag, (tag) => tag.articleTags)
  tag: Tag;
}
