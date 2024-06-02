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
      const gradeResult = await this.prisma.grade.upsert({
        where: {
          cardId_userId: {
            cardId,
            userId,
          },
        },
        update: {
          grade,
          card: {
            update: {
              shots: {
                increment: 1,
              },
            },
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

      const attemptResult = await this.prisma.cardAttempt.upsert({
        where: {
          userId_cardId: {
            userId,
            cardId,
          },
        },
        update: {
          attemptCount: {
            increment: 1,
          },
          lastAttempt: new Date(),
        },
        create: {
          attemptCount: 1,
          lastAttempt: new Date(),
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
        },
      })

      return { gradeResult, attemptResult }
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }
}
