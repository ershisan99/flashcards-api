import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { PrismaService } from '../../../prisma.service'
import { GetAllDecksDto } from '../dto/get-all-decks.dto'
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '../../../infrastructure/common/pagination/pagination.constants'

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
          user: {
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
    currentPage = DEFAULT_PAGE_NUMBER,
    pageSize = DEFAULT_PAGE_SIZE,
  }: GetAllDecksDto) {
    try {
      return await this.prisma.deck.findMany({
        where: {
          name: {
            contains: name,
          },
          user: {
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
