import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, IsOptional, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";

/**
 * ArtigoDto define o modelo de dados para um artigo.
 * Essa classe valida as informações que os usuários enviam garantindo
 * que o formato dos dados esteja correto.
 */
export class ArtigoDto {
  @ApiProperty({
    example: 'Artigo N1 Do KOMPARTILHA',
    description: 'Título do artigo',
    required: false,
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  @IsNotEmpty({ message: 'O título do artigo é obrigatório.' })
  title?: string;

  @ApiProperty({
    example: { type: 'doc', content: [/* estrutura do Tiptap JSON */] },
    description: 'Conteúdo do artigo em formato JSON',
    required: false,
  })
  @IsNotEmpty({ message: 'O conteúdo do artigo é obrigatório.' })
  content?: any;

  @ApiProperty({
    example: 'https://exemplo.com/banner.jpg',
    description: 'URL da imagem do Banner',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string' || !value.trim()) {
      return undefined;
    }
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
      return value;
    }
    const uploadUrl = process.env.UPLOAD_URL || 'http://localhost:3001/upload';
    return encodeURI(`${uploadUrl}/image/${value}`);
  })
  banner?: string;

  @ApiProperty({
    example: ["frontend", "backend"],
    description: "Lista de tags do artigo",
    required: false,
    type: [String],
  })
  @IsOptional()
  tags?: string[];
}
