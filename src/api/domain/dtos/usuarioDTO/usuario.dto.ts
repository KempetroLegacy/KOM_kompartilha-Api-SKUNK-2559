import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsEmail } from "class-validator";

export class UsuarioDto {
    @ApiPropertyOptional({
        example: 'Filipe Vieira',
        description: 'Nome do usuário (único)',
        uniqueItems: true,
        maxLength: 200,
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        example: 'user@email.com',
        description: 'E-mail do usuário',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        example: 'https://th.bing.com/th/id/OIP.wqLS0R1MAkJisAbkuJ2bPQHaEK?rs=1&pid=ImgDetMainh',
        description: 'URL foto de Perfil',
    })
    @IsOptional()
    @IsString()
    foto?: string;

    @ApiPropertyOptional({
        enum: ['admin', 'colaborador', 'visitante'],
        example: 'colaborador',
        description: 'Perfil do usuário',
        default: 'colaborador',
    })
    @IsOptional()
    @IsString()
    perfil?: string;

    @ApiPropertyOptional({
        example: 'Lauro de Freitas',
        description: 'Cidade do usuário',
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({
        example: '2003-07-27',
        description: 'Data de nascimento do usuário (YYYY-MM-DD)',
        type: String,
    })
    @IsOptional()
    @IsString()
    birthDate?: string;

    @ApiPropertyOptional({
        example: 'Centro Universitário Jorge Amado',
        description: 'Faculdade do usuário',
    })
    @IsOptional()
    @IsString()
    college?: string;

    @ApiPropertyOptional({
        example: 'Desenvolvedor',
        description: 'Cargo do usuário',
    })
    @IsOptional()
    @IsString()
    position?: string;
}