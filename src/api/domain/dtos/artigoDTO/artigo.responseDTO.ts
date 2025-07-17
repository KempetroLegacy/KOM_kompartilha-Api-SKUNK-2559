import { ApiProperty } from "@nestjs/swagger";
import { UsuarioResponseDTO } from "../usuarioDTO/usuario.responseDTO";

export class ArtigoResponseDTO {
  @ApiProperty({ example: 1, description: 'ID do artigo' })
  id: number;

  @ApiProperty({ example: 'Artigo N1 Do KOMPARTILHA', description: 'Título do artigo' })
  title: string;

  @ApiProperty({
    example: { type: 'doc', content: [/* estrutura do Tiptap JSON */] },
    description: 'Conteúdo do artigo em formato JSON'
  })
  content: any;  // Alterado de string para any (ou objeto)

  @ApiProperty({
    example: 'https://exemplo.com/banner.jpg',
    description: 'URL da imagem do Banner'
  })
  banner: string;

  @ApiProperty({ type: () => UsuarioResponseDTO })
  author: UsuarioResponseDTO;

  @ApiProperty({ example: ['frontend', 'backend'], description: 'Tags associadas ao artigo' })
  tags: string[];

  @ApiProperty({ example: '2025-04-07T10:31:00.000Z', description: 'Data de criação do artigo' })
  createdAt: Date;

  @ApiProperty({ example: '2025-04-07T12:45:00.000Z', description: 'Última atualização do artigo' })
  updatedAt: Date;
}
