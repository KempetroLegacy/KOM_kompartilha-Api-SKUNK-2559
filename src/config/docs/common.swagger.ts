import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger";

/**
 * Decorators comuns para operações CRUD
 */
export const CommonSwagger = {
  /**
   * Operação de listagem paginada
   */
  list: (entity: string, responseType?: any) =>
    applyDecorators(
      ApiOperation({
        summary: `Listar ${entity}s`,
        description: `Retorna todos os ${entity}s cadastrados no sistema`,
      }),
      ApiResponse({
        status: 200,
        description: `Lista de ${entity}s retornada com sucesso`,
        type: responseType ? [responseType] : undefined,
      })
    ),

  /**
   * Operação de busca por ID
   */
  findById: (entity: string, responseType?: any) =>
    applyDecorators(
      ApiOperation({
        summary: `Buscar ${entity} por ID`,
        description: `Obtém um ${entity} específico pelo seu identificador único`,
      }),
      ApiParam({
        name: "id",
        description: `ID numérico do ${entity}`,
        type: Number,
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: `${entity} encontrado e retornado`,
        type: responseType,
      }),
      ApiResponse({
        status: 404,
        description: `${entity} não encontrado`,
      })
    ),

  /**
   * Operação de criação com autenticação
   */
  create: (entity: string, responseType?: any) =>
    applyDecorators(
      ApiBearerAuth("JWT-auth"),
      ApiOperation({
        summary: `Criar novo ${entity}`,
        description: `Cria um novo ${entity} com autenticação JWT`,
      }),
      ApiResponse({
        status: 201,
        description: `${entity} criado com sucesso`,
        type: responseType,
      }),
      ApiResponse({
        status: 401,
        description: "Token de autenticação inválido",
      }),
      ApiResponse({
        status: 400,
        description: "Dados inválidos fornecidos",
      })
    ),

  /**
   * Operação de atualização com autenticação
   */
  update: (entity: string, responseType?: any) =>
    applyDecorators(
      ApiBearerAuth("JWT-auth"),
      ApiOperation({
        summary: `Atualizar ${entity}`,
        description: `Atualiza um ${entity} existente`,
      }),
      ApiParam({
        name: "id",
        description: `ID do ${entity} a ser atualizado`,
        type: Number,
      }),
      ApiResponse({
        status: 200,
        description: `${entity} atualizado com sucesso`,
        type: responseType,
      }),
      ApiResponse({
        status: 404,
        description: `${entity} não encontrado`,
      }),
      ApiResponse({
        status: 401,
        description: "Sem permissão para atualizar este recurso",
      })
    ),

  /**
   * Operação de remoção com autenticação
   */
  delete: (entity: string) =>
    applyDecorators(
      ApiBearerAuth("JWT-auth"),
      ApiOperation({
        summary: `Remover ${entity}`,
        description: `Remove um ${entity} do sistema`,
      }),
      ApiParam({
        name: "id",
        description: `ID do ${entity} a ser removido`,
        type: Number,
      }),
      ApiResponse({
        status: 200,
        description: `${entity} removido com sucesso`,
      }),
      ApiResponse({
        status: 404,
        description: `${entity} não encontrado`,
      }),
      ApiResponse({
        status: 401,
        description: "Sem permissão para remover este recurso",
      })
    ),
};
