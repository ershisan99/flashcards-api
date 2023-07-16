import { Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { PrismaService } from '../../prisma.service'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

@Injectable()
export class FileUploadService {
  constructor(private prismaService: PrismaService) {}

  async uploadFile(dataBuffer: Buffer, fileName: string) {
    const key = `${uuid()}-${fileName}`
    const bucketName = process.env.AWS_BUCKET_NAME
    const region = 'eu-central-1'
    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      },
    })
    const encodeFileName = encodeURIComponent(key)

    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${encodeFileName}`

    const fileStorageInDB = {
      fileName,
      fileUrl,
      key,
    }

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Body: dataBuffer,
      Key: key,
      ContentDisposition: 'inline',
      ContentType: `image/${fileName.split('.').at(-1)}`,
    })

    await s3.send(putCommand)

    return this.prismaService.fileEntity.create({
      data: fileStorageInDB,
    })
  }
}
