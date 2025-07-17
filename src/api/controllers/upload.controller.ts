import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
} from "@nestjs/common";
import { UploadService } from "src/api/services/upload.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { join } from "path";
import { Response } from "express";
import { ApiTags } from "@nestjs/swagger";
import { SwaggerUpload } from "src/config/docs/upload.swagger";
import { memoryStorage } from "multer";
import { createReadStream, existsSync } from "fs";

@Controller("upload")
@ApiTags("Gerenciamento de Uploads")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("image")
  @SwaggerUpload.uploadImage()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
    })
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.uploadService.handleFileUpload(file);
    return { url: imageUrl };
  }
}
