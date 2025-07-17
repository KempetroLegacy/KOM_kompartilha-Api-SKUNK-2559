import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../userRelations-entities/user.entity'; 
import { ArticleMember, ArticleTag } from './article-relations.entities';
import { IsIn, IsNotEmpty } from 'class-validator';

@Entity('articles')
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    @IsNotEmpty({ message: 'o título do seu artigo não pode estar vazio!' })
    title: string;

    @Column({ type: 'simple-json', nullable: true })
    @IsNotEmpty({ message: 'a descrição do seu artigo não pode estar vazio!' })
    content: any;     

    @Column({ nullable: true })
    banner: string;

    @Column({ default: 'published' })
    @IsIn(['published', 'archived', 'draft'], { message: 'O status do artigo deve ser "published", "archived" ou "draft".' })
    status: string;

    @ManyToOne(() => User, (user) => user.articles, { nullable: false })
    author: User;

    @Column()
    authorId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => ArticleMember, (articleMember) => articleMember.article)
    members: ArticleMember[];

    @OneToMany(() => ArticleTag, (articleTag) => articleTag.article)
    articleTags: ArticleTag[];

    @Column({ type: "datetime", nullable: true })
    deletedAt?: Date;
}
