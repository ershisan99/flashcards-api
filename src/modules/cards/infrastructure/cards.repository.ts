import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { PrismaService } from '../../../prisma.service'
import { GetAllCardsInDeckDto } from '../dto/get-all-cards.dto'
import { CreateCardDto } from '../dto/create-card.dto'

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
    { answer = undefined, question = undefined, currentPage, itemsPerPage }: GetAllCardsInDeckDto
  ) {
    try {
      return await this.prisma.card.findMany({
        where: {
          decks: {
            id: deckId,
          },
          question: {
            contains: question || undefined,
          },
          answer: {
            contains: answer || undefined,
          },
        },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
      })
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
