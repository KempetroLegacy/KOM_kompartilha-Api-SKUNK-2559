import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../userRelations-entities/user.entity'; 
import { ProjectMember, ProjectTag } from './project-relations.entities';
import { IsIn, IsNotEmpty } from 'class-validator';

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    @IsNotEmpty({ message: 'O título do seu projeto não pode estar vazio!' })
    title: string;

    @Column({ type: 'simple-json', nullable: true })
    @IsNotEmpty({ message: 'A descrição do seu projeto não pode estar vazia!' })
    content: any;     

    @Column({ nullable: true })
    banner: string;

    @Column({ default: 'published' })
    @IsIn(['published', 'archived', 'draft'], { message: 'O status do projeto deve ser "published", "archived" ou "draft".' })
    status: string;

    @ManyToOne(() => User, (user) => user.projects, { nullable: false })
    author: User;

    @Column()
    authorId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => ProjectMember, (projectMember) => projectMember.project)
    members: ProjectMember[];

    @OneToMany(() => ProjectTag, (projectTag) => projectTag.project)
    projectTags: ProjectTag[];

    @Column({ type: "datetime", nullable: true })
    deletedAt?: Date;

    @Column({ type: "datetime", nullable: true })
    startDate?: Date;

    @Column({ type: "datetime", nullable: true })
    endDate?: Date;
}