import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Article } from 'src/api/domain/entities/artigos-entities/articleBase.entity';
import { User } from 'src/api/domain/entities/userRelations-entities/user.entity';
import { ErrorMessages } from 'src/api/middlewares/validateRequest';

export class ArtigoValidatorHelper {
  static validateId(id: number): void {
    if (!id || isNaN(id)) {
      throw new BadRequestException(`ID inválido: ${id}`);
    }
  }

  static validateRequiredFields(title: any, content: any): void {
    if (!title || !content) {
      throw new BadRequestException('Título e conteúdo do artigo são obrigatórios.');
    }
  }

  static validateOwnership(article: Article, userId: number): void {
    if (article.author.id !== userId) {
      throw new UnauthorizedException(ErrorMessages.SEM_PERMISSAO);
    }
  }

  static validatePermissions(article: Article, user: User, userId: number): void {
    if (user.typeUser === 'ADMIN') return;
    if (article.author.id !== userId) {
      throw new UnauthorizedException('Você não tem permissão para esta operação.');
    }
  }

  static parseContent(content: any): any {
    if (typeof content === 'object') return content;
    
    if (typeof content === 'string') {
      const trimmed = content.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          return JSON.parse(trimmed);
        } catch (e) {
          throw new BadRequestException('O campo content não é um JSON válido.');
        }
      }
      throw new BadRequestException('Conteúdo inválido. Verifique se o conteúdo está sendo enviado como JSON.');
    }
    
    throw new BadRequestException('Tipo de conteúdo inválido.');
  }
}
