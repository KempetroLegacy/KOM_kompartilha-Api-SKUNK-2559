import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { User } from "../../entities/userRelations-entities/user.entity";

/**
 * UsuarioResponseDTO representa os dados de usuários retornados nas respostas da API.
 * Ele define a estrutura da resposta, garantindo que os atributos estejam organizados corretamente.
 */

export class UsuarioResponseDTO {
    @Expose()
    @ApiProperty({ example: 1, description: 'ID do usuário' })
    id: number;

    @Expose()
    @ApiProperty({ example: 'Filipe Vieira', description: 'Nome do usuário' })
    name: string; 

    @Expose()
    @ApiProperty({ example: 'https://exemplo.com/foto.jpg', description: 'URL da foto de perfil' })
    image: string; 

    @Expose()
    @ApiProperty({
        enum: ['admin', 'colaborador', 'visitante'],
        example: 'colaborador',
        description: 'Tipo do usuário',
    })
    typeUser: string; 

    @Expose()
    @ApiProperty({ example: '2025-01-01T00:00:00.000Z', description: 'Data de criação do usuário' })
    createdAt: Date;

    @Expose()
    @ApiProperty({ example: 'Lauro de Freitas', description: 'Cidade do usuário', required: false })
    city?: string;

    @Expose()
    @ApiProperty({ example: '2003-07-27', description: 'Data de nascimento do usuário', required: false, type: String })
    birthDate?: string;

    @Expose()
    @ApiProperty({ example: 'Centro Universitário Jorge Amado', description: 'Faculdade do usuário', required: false })
    college?: string;

    static fromEntity(user: User): UsuarioResponseDTO {
        console.log("✅ Debug dentro do DTO - Estrutura final do autor:", {
            id: user.id,
            name: user.name,
            image: user.image,
            typeUser: user.typeUser,
            createdAt: user.createdAt,
        });
        return {
            id: user.id,
            name: user.name,
            image: user.image,
            typeUser: user.typeUser,
            createdAt: user.createdAt,
        };
    }
}
