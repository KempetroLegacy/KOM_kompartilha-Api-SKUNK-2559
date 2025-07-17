import { ApiProperty } from "@nestjs/swagger";
import { UsuarioResponseDTO } from "../usuarioDTO/usuario.responseDTO";

export class ProjetoResponseDTO {
  @ApiProperty({ example: 1, description: 'ID do projeto' })
  id: number;

  @ApiProperty({ example: 'Projeto N1 Do KOMPARTILHA', description: 'Título do projeto' })
  title: string;

  @ApiProperty({
    example: { type: 'doc', content: [/* estrutura do Tiptap JSON */] },
    description: 'Conteúdo do projeto em formato JSON'
  })
  content: any;

  @ApiProperty({
    example: 'https://exemplo.com/banner.jpg',
    description: 'URL da imagem do Banner'
  })
  banner: string;

  @ApiProperty({ type: () => UsuarioResponseDTO })
  author: UsuarioResponseDTO;

  @ApiProperty({ example: ['frontend', 'backend'], description: 'Tags associadas ao projeto' })
  tags: string[];

  @ApiProperty({ example: '2025-07-10', description: 'Data de início do projeto' })
  startDate: string;

  @ApiProperty({ example: '2025-08-10', description: 'Data de término do projeto' })
  endDate: string;

  @ApiProperty({ example: '2025-04-07T10:31:00.000Z', description: 'Data de criação do projeto' })
  createdAt: Date;

  @ApiProperty({ example: '2025-04-07T12:45:00.000Z', description: 'Última atualização do projeto' })
  updatedAt: Date;
}
