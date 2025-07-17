import { Module } from '@nestjs/common';
import { UploadService } from 'src/api/services/upload.service';
import { AzureBlobService } from 'src/api/services/azure-blob.service';
import { UploadController } from 'src/api/controllers/upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, AzureBlobService],
  exports: [UploadService, AzureBlobService],
})
export class UploadModule {}
