// errors/error.responses.ts
import { ApiResponse } from '@nestjs/swagger';

export const ErrorMessages = {
  ARTIGO_NAO_ENCONTRADO: "Artigo não encontrado",
  PROJETO_NAO_ENCONTRADO: "Projeto não encontrado",
  USUARIO_NAO_ENCONTRADO: "Usuário não encontrado",
  SEM_PERMISSAO: "Você não tem permissão para modificar este artigo",
  ERRO_INTERNO: "Ocorreu um erro interno. Tente novamente mais tarde."
};

export class ErrorResponses {
  static BadRequest(message = ErrorMessages.ERRO_INTERNO) {
    return ApiResponse({
      status: 400,
      description: message,
    });
  }

  static Unauthorized(message = 'Não autorizado') {
    return ApiResponse({
      status: 401,
      description: message,
    });
  }

  static NotFound(entity = 'Entidade') {
    return ApiResponse({
      status: 404,
      description: `${entity} não encontrada`,
    });
  }

  static InternalServerError(message = ErrorMessages.ERRO_INTERNO) {
    return ApiResponse({
      status: 500,
      description: message,
    });
  }

  static UserNotFoundByEmail(email: string) {
    return ApiResponse({
      status: 404,
      description: `Usuário com o e-mail ${email} não foi encontrado`,
    });
  }
}
