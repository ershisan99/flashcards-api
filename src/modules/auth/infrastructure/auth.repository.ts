import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma.service'

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async createRefreshToken(userId: string, token: string, expiresAt: Date) {
    return await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        isRevoked: false,
      },
    })
  }
}
