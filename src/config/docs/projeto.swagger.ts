import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ProjetoDto } from "src/api/domain/dtos/projetoDTO/projeto.dto";
import { ProjetoResponseDTO } from "src/api/domain/dtos/projetoDTO/projeto.responseDTO";
import { CommonSwagger } from "./common.swagger";

export const SwaggerProjeto = {
  listar: () => CommonSwagger.list("projeto", ProjetoResponseDTO),
  buscarPorId: () => CommonSwagger.findById("projeto", ProjetoResponseDTO),
  atualizar: () => CommonSwagger.update("projeto", ProjetoResponseDTO),
  remover: () => CommonSwagger.delete("projeto"),

  criar: () =>
    applyDecorators(
      ApiOperation({
        summary: "Criar novo projeto",
        description: "Cria um novo projeto com autenticação JWT",
      }),
      ApiConsumes('multipart/form-data'),
      ApiBody({
        description: "Dados do projeto e arquivos",
        schema: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
              description: 'Dados do projeto em JSON',
              example: JSON.stringify({
                title: "Título do projeto",
                content: { blocks: [] },
                tags: ["frontend", "backend"],
                startDate: "2025-07-10",
                endDate: "2025-08-10"
              })
            },
            file: {
              type: 'string',
              format: 'binary',
              description: 'Arquivo de banner (opcional)'
            }
          },
          required: ['project']
        }
      }),
      ApiResponse({
        status: 201,
        description: "Projeto criado com sucesso",
        type: ProjetoResponseDTO,
      })
    ),

  salvarRascunho: () =>
    applyDecorators(
      ApiOperation({
        summary: "Salvar projeto como rascunho",
        description: "Move um projeto para a área de rascunhos",
      }),
      ApiResponse({
        status: 200,
        description: "Rascunho salvo com sucesso",
        type: ProjetoResponseDTO,
      })
    ),

  listarRascunhos: () =>
    applyDecorators(
      ApiOperation({
        summary: "Listar rascunhos de projeto",
        description: "Retorna todos os rascunhos de projeto do usuário autenticado",
      }),
      ApiResponse({
        status: 200,
        description: "Lista de rascunhos retornada",
        type: [ProjetoResponseDTO],
      })
    ),

  listarArquivados: () =>
    applyDecorators(
      ApiOperation({
        summary: "Listar projetos arquivados",
        description: "Retorna todos os projetos arquivados (lixeira)",
      }),
      ApiResponse({
        status: 200,
        description: "Lista de projetos arquivados",
        type: [ProjetoResponseDTO],
      })
    ),

  buscarPorTermo: () =>
    applyDecorators(
      ApiOperation({
        summary: "Buscar projetos por termo",
        description: "Busca projetos pelo título ou descrição usando query param 'query'",
      }),
      ApiResponse({ status: 200, description: 'Lista de projetos encontrados', type: ProjetoResponseDTO, isArray: true }),
      ApiResponse({ status: 400, description: 'Parâmetro de busca inválido' })
    ),
};