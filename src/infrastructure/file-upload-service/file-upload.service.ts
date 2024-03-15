import { CreateFileDto, FileType, StorageService } from '@it-incubator/storage-sdk'
import { Injectable } from '@nestjs/common'

import { PrismaService } from '../../prisma.service'

@Injectable()
export class FileUploadService {
  constructor(
    private prismaService: PrismaService,
    private storageService: StorageService
  ) {}

  private async uploadFileToStorageService(dto: CreateFileDto) {
    return await this.storageService.create(dto).then(data => data.data)
  }

  async uploadFile(file: CreateFileDto['file']) {
    try {
      const savedFile = await this.uploadFileToStorageService({
        fileType: FileType.Image,
        file,
      })

      return this.prismaService.fileEntity.create({
        data: {
          fileName: savedFile.name,
          fileUrl: savedFile.url,
          key: savedFile.url,
        },
      })
    } catch (e) {
      console.log(e)
    }
  }
}
