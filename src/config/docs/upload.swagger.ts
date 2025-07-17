import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

export const SwaggerUpload = {
  uploadImage: () =>
    applyDecorators(
      ApiOperation({ summary: "Upload de imagem", description: "Faz upload de uma imagem (JPEG, PNG, WEBP)" }),
      ApiConsumes("multipart/form-data"),
      ApiBody({
        schema: {
          type: "object",
          properties: {
            file: {
              type: "string",
              format: "binary",
              description: "Arquivo de imagem para upload",
            },
          },
        },
      }),
      ApiResponse({ status: 201, description: "Imagem enviada com sucesso", schema: { example: { url: "/uploads/arquivo.jpg" } } }),
    ),
  getImage: () =>
    applyDecorators(
      ApiOperation({ summary: "Obter imagem", description: "Retorna uma imagem pelo nome do arquivo" }),
      ApiParam({ name: "filename", type: String, description: "Nome do arquivo" }),
      ApiResponse({ status: 200, description: "Imagem retornada com sucesso" }),
    ),
  downloadFile: () =>
    applyDecorators(
      ApiOperation({ summary: "Download de arquivo", description: "Faz download de um arquivo pelo nome" }),
      ApiParam({ name: "filename", type: String, description: "Nome do arquivo" }),
      ApiResponse({ status: 200, description: "Arquivo baixado com sucesso" }),
    ),
};