import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  MaxLength,
  IsOptional,
  IsNotEmpty,
  IsDateString,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * ProjetoDto define o modelo de dados para um projeto.
 * Essa classe valida as informações que os usuários enviam garantindo
 * que o formato dos dados esteja correto.
 */
export class ProjetoDto {
  @ApiProperty({
    example: "Projeto N1 Do KOMPARTILHA",
    description: "Título do projeto",
    required: false,
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  @IsNotEmpty({ message: "O título do projeto é obrigatório." })
  title?: string;

  @ApiProperty({
    example: {
      type: "doc",
      content: [
        /* estrutura do Tiptap JSON */
      ],
    },
    description: "Conteúdo do projeto em formato JSON",
    required: false,
  })
  @IsNotEmpty({ message: "O conteúdo do projeto é obrigatório." })
  content?: any;

  @ApiProperty({
    example: "https://exemplo.com/banner.jpg",
    description: "URL da imagem do Banner",
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== "string" || !value.trim()) {
      return undefined;
    }
    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("/")
    ) {
      return value;
    }
    const uploadUrl = process.env.UPLOAD_URL || "http://localhost:3001/upload";
    return encodeURI(`${uploadUrl}/image/${value}`);
  })
  banner?: string;

  @ApiProperty({
    example: ["frontend", "backend"],
    description: "Lista de tags do projeto",
    required: false,
    type: [String],
  })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    example: "2025-07-10",
    description: "Data de início do projeto",
    required: true,
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: "2025-08-10",
    description: "Data de término do projeto",
    required: false, 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
