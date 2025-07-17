import { ProjetoResponseDTO } from "../../api/domain/dtos/projetoDTO/projeto.responseDTO";
import { Project } from "../../api/domain/entities/projeto-entities/projectBase.entity";
import { ProjectDraft } from "../../api/domain/entities/projeto-entities/projectStatus";

export class ProjetoMapper {
    static toResponseDTO(projeto: Project | ProjectDraft): ProjetoResponseDTO {
        // Verifica se é um draft ou um projeto normal
        const isDraft = projeto.constructor.name === 'ProjectDraft' || 
                       (projeto as any).projectDraftTags !== undefined;
        
        const tags = isDraft 
            ? (projeto as ProjectDraft).projectDraftTags?.map(pt => pt.tag?.name) ?? []
            : (projeto as Project).projectTags?.map(pt => pt.tag?.name) ?? [];

        return {
            id: projeto.id,
            title: projeto.title,
            content: projeto.content,
            banner: projeto.banner,
            author: {
                id: projeto.author.id,
                name: projeto.author.name,
                image: projeto.author.image,
                typeUser: projeto.author.typeUser,
                createdAt: projeto.author.createdAt,
            },
            tags,
            startDate: projeto.startDate ? projeto.startDate.toISOString() : "",
            endDate: projeto.endDate ? projeto.endDate.toISOString() : "",
            createdAt: projeto.createdAt,
            updatedAt: projeto.updatedAt,
        };
    }
}