import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ArtigoDto } from "src/api/domain/dtos/artigoDTO/artigo.dto"; 
import { ArtigoResponseDTO } from "src/api/domain/dtos/artigoDTO/artigo.responseDTO"; 
import { CommonSwagger } from "./common.swagger";

export const SwaggerArtigo = {
  // Usar operações comuns do CommonSwagger
  listar: () => CommonSwagger.list("artigo", ArtigoResponseDTO),
  buscarPorId: () => CommonSwagger.findById("artigo", ArtigoResponseDTO),
  atualizar: () => CommonSwagger.update("artigo", ArtigoResponseDTO),
  remover: () => CommonSwagger.delete("artigo"),

  // Operações específicas de artigo
  criar: () =>
    applyDecorators(
      ApiOperation({
        summary: "Criar novo artigo",
        description: "Cria um novo artigo com autenticação JWT",
      }),
      ApiConsumes('multipart/form-data'),
      ApiBody({
        description: "Dados do artigo e arquivos",
        schema: {
          type: 'object',
          properties: {
            article: {
              type: 'string',
              description: 'Dados do artigo em JSON',
              example: JSON.stringify({
                title: "Título do artigo",
                content: { blocks: [] },
                tags: ["tecnologia", "programação"]
              })
            },
            file: {
              type: 'string',
              format: 'binary',
              description: 'Arquivo de banner (opcional)'
            }
          },
          required: ['article']
        }
      }),
      ApiResponse({
        status: 201,
        description: "Artigo criado com sucesso",
        type: ArtigoResponseDTO,
      })
    ),

  salvarRascunho: () =>
    applyDecorators(
      ApiOperation({
        summary: "Salvar artigo como rascunho",
        description: "Move um artigo para a área de rascunhos",
      }),
      ApiResponse({
        status: 200,
        description: "Rascunho salvo com sucesso",
        type: ArtigoResponseDTO,
      })
    ),

  listarRascunhos: () =>
    applyDecorators(
      ApiOperation({
        summary: "Listar rascunhos",
        description: "Retorna todos os rascunhos do usuário autenticado",
      }),
      ApiResponse({
        status: 200,
        description: "Lista de rascunhos retornada",
        type: [ArtigoResponseDTO],
      }),
      ApiParam({
              name: "userId",
              description: `ID numérico }`,
              type: Number,
              example: 1,
            }),
    ),

  listarArquivados: () =>
    applyDecorators(
      ApiOperation({
        summary: "Listar artigos arquivados",
        description: "Retorna todos os artigos arquivados (lixeira)",
      }),
      ApiResponse({
        status: 200,
        description: "Lista de artigos arquivados",
        type: [ArtigoResponseDTO],
      })
    ),

  buscarPorTermo: () =>
    applyDecorators(
      ApiOperation({
        summary: "Buscar artigos por termo",
        description: "Busca artigos pelo título ou conteúdo usando query param 'query'",
      }),
      ApiResponse({ status: 200, description: 'Lista de artigos encontrados', type: ArtigoResponseDTO, isArray: true }),
      ApiResponse({ status: 400, description: 'Parâmetro de busca inválido' })
    ),
};
