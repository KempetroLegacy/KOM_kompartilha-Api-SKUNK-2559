import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Article } from '../artigos-entities/articleBase.entity';
import { ArticleMember } from '../artigos-entities/article-relations.entities';
import { Project } from '../projeto-entities/projectBase.entity';
import { ProjectMember } from '../projeto-entities/project-relations.entities';
import { IsEmail, IsNotEmpty } from 'class-validator';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    @IsNotEmpty({ message: 'O nome não pode estar vazio!' })
    name: string;

    @Column({ unique: true })
    @IsEmail({}, { message: 'E-mail inválido' })
    @IsNotEmpty({ message: 'O email não pode estar vazio!' })
    email: string;

    @Column({ nullable: true })
    bio: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    image: string;

    @Column({ nullable: true })
    backgroundImage: string;

    @Column()
    typeUser: string;

    @Column({ nullable: true })
    position: string; 

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Article, (article) => article.author)
    articles: Article[];

    @OneToMany(() => ArticleMember, (articleMember) => articleMember.user)
    articleMembers: ArticleMember[];

    // Adicione estas relações para projetos:
    @OneToMany(() => Project, (project) => project.author)
    projects: Project[];

    @OneToMany(() => ProjectMember, (projectMember) => projectMember.user)
    projectMembers: ProjectMember[];

    @Column({ nullable: true })
    city: string;

    @Column({ type: 'date', nullable: true })
    birthDate: Date | null;

    @Column({ nullable: true })
    college: string;

}