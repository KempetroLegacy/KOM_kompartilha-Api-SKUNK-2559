import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  nomeUsuario: string;

  @IsString()
  @MinLength(6)
  password: string;
}
