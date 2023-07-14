import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { PrismaService } from '../../../prisma.service'
import { GetAllDecksDto } from '../dto/get-all-decks.dto'
import { Pagination } from '../../../infrastructure/common/pagination/pagination.service'
import { createPrismaOrderBy } from '../../../infrastructure/common/helpers/get-order-by-object'

@Injectable()
export class DecksRepository {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(DecksRepository.name)

  async createDeck({
    name,
    userId,
    cover,
    isPrivate,
  }: {
    name: string
    userId: string
    cover?: string
    isPrivate?: boolean
  }) {
    try {
      return await this.prisma.deck.create({
        data: {
          author: {
            connect: {
              id: userId,
            },
          },

          name,
          cover,
          isPrivate,
        },
      })
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  async findAllDecks({
    name = undefined,
    authorId = undefined,
    userId,
    currentPage,
    itemsPerPage,
    minCardsCount,
    maxCardsCount,
    orderBy,
  }: GetAllDecksDto) {
    console.log(minCardsCount)
    console.log(Number(minCardsCount))
    try {
      const where = {
        cardsCount: {
          gte: minCardsCount ? Number(minCardsCount) : undefined,
          lte: maxCardsCount ? Number(maxCardsCount) : undefined,
        },
        name: {
          contains: name,
        },
        author: {
          id: authorId || undefined,
        },
        OR: [
          {
            AND: [
              {
                isPrivate: true,
              },
              {
                userId: userId,
              },
            ],
          },
          {
            isPrivate: false,
          },
        ],
      }

      const [count, items, max] = await this.prisma.$transaction([
        this.prisma.deck.count({
          where,
        }),
        this.prisma.deck.findMany({
          where,
          orderBy: createPrismaOrderBy(orderBy),
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          skip: (currentPage - 1) * itemsPerPage,
          take: itemsPerPage,
        }),
        this.prisma
          .$queryRaw`SELECT MAX(card_count) as maxCardsCount FROM (SELECT COUNT(*) as card_count FROM card GROUP BY deckId) AS card_counts;`,
      ])
      return {
        maxCardsCount: Number(max[0].maxCardsCount),
        ...Pagination.transformPaginationData([count, items], { currentPage, itemsPerPage }),
      }
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  public async findDeckById(id: string) {
    try {
      return await this.prisma.deck.findUnique({
        where: {
          id,
        },
      })
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }
  public async findDeckByCardId(cardId: string) {
    try {
      const card = await this.prisma.card.findUnique({
        where: {
          id: cardId,
        },
      })

      return await this.prisma.deck.findUnique({
        where: {
          id: card.deckId,
        },
      })
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  public async deleteDeckById(id: string) {
    try {
      return await this.prisma.deck.delete({
        where: {
          id,
        },
      })
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  public async updateDeckById(
    id: string,
    data: { name?: string; cover?: string; isPrivate?: boolean }
  ) {
    try {
      return await this.prisma.deck.update({
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
