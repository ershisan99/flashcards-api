import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { PrismaService } from '../../../prisma.service'
import { GetAllCardsInDeckDto } from '../dto/get-all-cards.dto'
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '../../../infrastructure/common/pagination/pagination.constants'
import { CreateCardDto } from '../dto/create-card.dto'

@Injectable()
export class CardsRepository {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(CardsRepository.name)
  async createCard(deckId: string, userId: string, card: CreateCardDto) {
    try {
      return await this.prisma.card.create({
        data: {
          user: {
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
      currentPage = DEFAULT_PAGE_NUMBER,
      pageSize = DEFAULT_PAGE_SIZE,
    }: GetAllCardsInDeckDto
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
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
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
