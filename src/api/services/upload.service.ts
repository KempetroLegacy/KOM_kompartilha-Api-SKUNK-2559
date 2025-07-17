import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { AzureBlobService } from './azure-blob.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {

  constructor(private readonly azureBlobService: AzureBlobService) {}

  async handleFileUpload(file: Express.Multer.File): Promise<string > {
    if (!file) {
      throw new BadRequestException("Nenhum arquivo enviado");
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Tipo de arquivo não suportado, apenas JPEG, PNG e WEBP são permitidos"
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        "O arquivo excede o tamanho máximo permitido (5MB)."
      );
    }

    try {
      console.log(`➡️ UploadService: Enviando arquivo ${file.originalname} para o Azure...`);
      const blobName = `${Date.now()}-${file.originalname}`;
      const url = await this.azureBlobService.uploadFile(file, blobName);
      console.log(`✅ UploadService: Upload concluído. URL: ${url}`);
      return url;
    } catch (error) {
      console.error("❌ Erro no UploadService ao chamar o Azure:", error);
      throw new Error("Falha ao fazer upload do arquivo para o armazenamento.");
    }

    const blobName = `${Date.now()}-${file.originalname}`;
    const url = await this.azureBlobService.uploadFile(file, blobName);

    return  url;
  }

  async downloadImage(imageUrl: string): Promise<string> {
    try {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      let ext = path.extname(new URL(imageUrl).pathname);
      if (!ext || ext.length > 5) ext = ".jpg";

      const filename = `downloaded_${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, response.data);
      console.log(`✅ Imagem baixada corretamente: ${filename}`);

      return filename;
    } catch (error) {
      throw new BadRequestException(
        "Erro ao baixar a imagem: " + error.message
      );
    }
  }

  
  public getBlobUrlWithSas(fileName: string): string {
    return this.azureBlobService.getBlobUrlWithSas(fileName);
  }
}
