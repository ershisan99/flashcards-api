import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'

import {
  createPrismaOrderBy,
  getOrderByObject,
} from '../../../infrastructure/common/helpers/get-order-by-object'
import { Pagination } from '../../../infrastructure/common/pagination/pagination.service'
import { PrismaService } from '../../../prisma.service'
import { CreateCardDto, GetAllCardsInDeckDto, UpdateCardDto } from '../dto'
import { CardWithGrade, PaginatedCardsWithGrade } from '../entities/cards.entity'

@Injectable()
export class CardsRepository {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(CardsRepository.name)

  async createCard(deckId: string, userId: string, card: CreateCardDto) {
    try {
      return await this.prisma.$transaction(async tx => {
        const created = await tx.card.create({
          data: {
            author: {
              connect: {
                id: userId,
              },
            },
            decks: {
              connect: {
                id: deckId,
              },
            },

            ...card,
          },
        })

        await tx.deck.update({
          where: {
            id: deckId,
          },
          data: {
            cardsCount: {
              increment: 1,
            },
          },
        })

        return created
      })
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  async findCardsByDeckId(
    deckId: string,
    userId: string,
    {
      answer = undefined,
      question = undefined,
      currentPage,
      itemsPerPage,
      orderBy,
    }: GetAllCardsInDeckDto
  ): Promise<PaginatedCardsWithGrade> {
    try {
      const where = {
        decks: {
          id: deckId,
        },
        question: {
          contains: question || undefined,
        },
        answer: {
          contains: answer || undefined,
        },
      }

      const { key, direction } = getOrderByObject(orderBy)

      if (key === 'grade') {
        const start = (currentPage - 1) * itemsPerPage

        const sqlQuery = `
          SELECT c.*, g.grade as userGrade
          FROM card AS c
          LEFT JOIN grade AS g ON c.id = g.cardId AND g.userId = ?
          WHERE c.deckId = ? AND 
            (c.question LIKE ? OR c.answer LIKE ?)
          ORDER BY g.grade ${direction}
          LIMIT ?, ? 
          `

        const cardsRaw = (await this.prisma.$queryRawUnsafe(
          sqlQuery,
          userId,
          deckId,
          `%${question || ''}%`,
          `%${answer || ''}%`,
          start,
          itemsPerPage
        )) satisfies Array<any>

        const cards: CardWithGrade[] = cardsRaw.map(({ userGrade, ...card }) => ({
          ...card,
          grades: [
            {
              grade: userGrade,
            },
          ],
        }))

        const totalCount = await this.prisma.card.count({ where })

        return Pagination.transformPaginationData([totalCount, cards], {
          currentPage,
          itemsPerPage,
        })
      } else {
        const result = await this.prisma.$transaction([
          this.prisma.card.count({ where }),
          this.prisma.card.findMany({
            orderBy: createPrismaOrderBy(orderBy) || { updated: 'desc' },
            where,
            include: {
              grades: {
                where: {
                  userId,
                },
                select: {
                  grade: true,
                },
              },
            },
            skip: (currentPage - 1) * itemsPerPage,
            take: itemsPerPage,
          }),
        ])

        return Pagination.transformPaginationData(result, { currentPage, itemsPerPage })
      }
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  async findCardsByDeckIdWithGrade(userId: string, deckId: string) {
    try {
      return this.prisma.card.findMany({
        where: {
          deckId,
        },
        include: {
          grades: {
            where: {
              userId,
            },
          },
        },
      })
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  public async findCardById(id: string) {
    try {
      return await this.prisma.card.findUnique({
        where: {
          id,
        },
      })
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  public async deleteCardById(id: string) {
    try {
      return await this.prisma.$transaction(async tx => {
        const deleted = await tx.card.delete({
          where: {
            id,
          },
        })

        await tx.deck.update({
          where: {
            id: deleted.deckId,
          },
          data: {
            cardsCount: {
              decrement: 1,
            },
          },
        })

        return deleted
      })
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  public async updateCardById(id: string, data: UpdateCardDto) {
    try {
      return await this.prisma.card.update({
        where: {
          id,
        },
        data,
      })
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }
}
