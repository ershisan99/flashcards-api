import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'

import { PrismaService } from '../../../prisma.service'

@Injectable()
export class GradesRepository {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(GradesRepository.name)

  async createGrade({
    cardId,
    userId,
    deckId,
    grade,
  }: {
    cardId: string
    userId: string
    deckId: string
    grade: number
  }) {
    try {
      return await this.prisma.grade.upsert({
        where: {
          userId,
          cardId,
          deckId,
        },
        update: {
          grade,
          shots: {
            increment: 1,
          },
        },
        create: {
          grade,
          shots: 1,
          user: {
            connect: {
              id: userId,
            },
          },
          card: {
            connect: {
              id: cardId,
            },
          },
          deck: {
            connect: {
              id: deckId,
            },
          },
        },
      })
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }
}
