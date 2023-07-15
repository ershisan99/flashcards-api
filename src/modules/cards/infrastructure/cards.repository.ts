import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { PrismaService } from '../../../prisma.service'
import { GetAllCardsInDeckDto } from '../dto/get-all-cards.dto'
import { CreateCardDto } from '../dto/create-card.dto'
import { Pagination } from '../../../infrastructure/common/pagination/pagination.service'
import { createPrismaOrderBy } from '../../../infrastructure/common/helpers/get-order-by-object'
import { UpdateCardDto } from '../dto/update-card.dto'

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
    {
      answer = undefined,
      question = undefined,
      currentPage,
      itemsPerPage,
      orderBy,
    }: GetAllCardsInDeckDto
  ) {
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
      const result = await this.prisma.$transaction([
        this.prisma.card.count({ where }),
        this.prisma.card.findMany({
          orderBy: createPrismaOrderBy(orderBy) || { updated: 'desc' },
          where,
          skip: (currentPage - 1) * itemsPerPage,
          take: itemsPerPage,
        }),
      ])
      return Pagination.transformPaginationData(result, { currentPage, itemsPerPage })
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
              deckId,
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
