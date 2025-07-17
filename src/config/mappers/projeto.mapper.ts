import { ProjetoResponseDTO } from "../../api/domain/dtos/projetoDTO/projeto.responseDTO";
import { Project } from "../../api/domain/entities/projeto-entities/projectBase.entity";

export class ProjetoMapper {
    static toResponseDTO(projeto: Project): ProjetoResponseDTO {
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
            tags: projeto.projectTags?.map(pt => pt.tag?.name) ?? [],
            startDate: projeto.startDate ? projeto.startDate.toISOString() : "",
            endDate: projeto.endDate ? projeto.endDate.toISOString() : "",
            createdAt: projeto.createdAt,
            updatedAt: projeto.updatedAt,
        };
    }
}