import { ArtigoResponseDTO } from "../../api/domain/dtos/artigoDTO/artigo.responseDTO"; 
import { Article } from "../../api/domain/entities/artigos-entities/articleBase.entity"; 

export class ArtigoMapper {
    static toResponseDTO(artigo: Article): ArtigoResponseDTO {
        return {
            id: artigo.id,
            title: artigo.title,
            content: artigo.content,
            banner: artigo.banner,
            author: {
                id: artigo.author.id,
                name: artigo.author.name,
                image: artigo.author.image,
                typeUser: artigo.author.typeUser,
                createdAt: artigo.author.createdAt,
            },
            tags: artigo.articleTags?.map(at => at.tag?.name) ?? [],
            createdAt: artigo.createdAt,
            updatedAt: artigo.updatedAt,
        };
    }
}



