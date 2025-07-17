import { Injectable } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import * as mime from "mime-types";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

@Injectable()
export class AzureBlobService {
  private blobServiceClient: BlobServiceClient;
  private containerClient;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    console.log("🚀 ~ AzureBlobService ~ constructor ~ connectionString:", connectionString)
    const containerName = process.env.CONTAINER_NAME || 'meu-container';
    console.log("🚀 ~ AzureBlobService ~ constructor ~ containerName:", containerName)
    if (!connectionString) throw new Error('AZURE_STORAGE_CONNECTION_STRING não definido');
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = this.blobServiceClient.getContainerClient(containerName);
  }

  async uploadFile(file: Express.Multer.File, blobName: string): Promise<string> {

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    const contentType = mime.lookup(blobName) || "application/octet-stream";
    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    };

    await blockBlobClient.uploadData(file.buffer, uploadOptions);

    const blob_url = `${blockBlobClient.url}?${process.env.CONTAINER_TOKEN_SAS}`

    return blob_url;
  }

    public getBlobUrlWithSas(fileName: string): string {
    const containerName = process.env.CONTAINER_NAME;
    const sasToken = process.env.CONTAINER_TOKEN_SAS;
    return `https://kemdevelopment.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`;
  }
}