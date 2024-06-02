import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { pick } from 'remeda'

import {
  createPrismaOrderBy,
  getOrderByObject,
} from '../../../infrastructure/common/helpers/get-order-by-object'
import { Pagination } from '../../../infrastructure/common/pagination/pagination.service'
import { PrismaService } from '../../../prisma.service'
import { CreateCardDto, GetAllCardsInDeckDto, UpdateCardDto } from '../dto'
import { CardWithGrades, PaginatedCardsWithGrades } from '../entities/cards.entity'

@Injectable()
export class CardsRepository {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(CardsRepository.name)

  async createCard(deckId: string, userId: string, card: CreateCardDto) {
    try {
      return await this.prisma.card.create({
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
  ): Promise<PaginatedCardsWithGrades> {
    if (!orderBy || orderBy === 'null') {
      orderBy = 'updated-desc'
    }
    try {
      const where = {
        decks: {
          id: deckId,
        },
        question: {
          contains: question || undefined,
          mode: 'insensitive' as const,
        },
        answer: {
          contains: answer || undefined,
          mode: 'insensitive' as const,
        },
      }

      const { key, direction } = getOrderByObject(orderBy) || {}

      if (key === 'grade') {
        const start = (currentPage - 1) * itemsPerPage

        // Initialize parts of the WHERE clause
        const whereParts = []
        const queryParams: any[] = [userId, deckId]

        // Add conditions for question and answer if they are provided
        if (question) {
          whereParts.push(`c."question" ILIKE $${queryParams.length + 1}`)
          queryParams.push(`%${question}%`)
        }

        if (answer) {
          whereParts.push(`c."answer" ILIKE $${queryParams.length + 1}`)
          queryParams.push(`%${answer}%`)
        }

        // If no specific conditions are provided, match everything
        if (whereParts.length === 0) {
          whereParts.push('TRUE')
        }

        const whereClause = whereParts.join(' OR ')

        const sqlQuery = `
        SELECT c.*, g.grade as "userGrade", COALESCE(a."attemptCount", 0) as "totalAttempts"
        FROM flashcards.card AS c
        LEFT JOIN flashcards.grade AS g ON c.id = g."cardId" AND g."userId" = $1
        LEFT JOIN flashcards.cardAttempt AS a ON c.id = a."cardId" AND a."userId" = $1
        WHERE c."deckId" = $2 AND (${whereClause})
        ORDER BY g."grade" ${direction === 'asc' ? 'ASC NULLS FIRST' : 'DESC NULLS LAST'}
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `

        // Add itemsPerPage and start to the queryParams
        queryParams.push(itemsPerPage, start)

        const cardsRaw = (await this.prisma.$queryRawUnsafe(
          sqlQuery,
          ...queryParams
        )) satisfies Array<any>

        const cards: CardWithGrades[] = cardsRaw.map(({ userGrade, totalAttempts, ...card }) => ({
          ...card,
          grades: [
            {
              grade: userGrade,
            },
          ],
          attempts: totalAttempts,
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
            orderBy: createPrismaOrderBy(orderBy),
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
              attempts: {
                where: {
                  userId,
                },
                select: {
                  attemptCount: true,
                },
              },
            },
            skip: (currentPage - 1) * itemsPerPage,
            take: itemsPerPage,
          }),
        ])

        const [totalCount, cardsRaw] = result

        const cards = cardsRaw.map(card => ({
          ...card,
          shots: card.attempts.reduce((acc, attempt) => acc + attempt.attemptCount, 0),
        }))

        console.log(cards)

        return Pagination.transformPaginationData([totalCount, cards], {
          currentPage,
          itemsPerPage,
        })
      }
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  async findCardsByDeckIdWithGrade(userId: string, deckId: string) {
    try {
      const cards = await this.prisma.card.findMany({
        where: {
          deckId,
        },
        include: {
          grades: {
            where: {
              userId,
            },
          },
          attempts: {
            where: {
              userId,
            },
          },
        },
      })

      return cards.map(card => ({
        ...card,
        shots: card.attempts.reduce((acc, attempt) => acc + attempt.attemptCount, 0),
      }))
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
      return await this.prisma.card.delete({
        where: {
          id,
        },
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

  private async getSmartRandomCard(cards: Array<CardWithGrades>): Promise<CardWithGrades> {
    const selectionPool: Array<CardWithGrades> = []

    cards.forEach(card => {
      // Calculate the average grade for the card
      const averageGrade =
        card.grades.length === 0
          ? 0
          : card.grades.reduce((acc, grade) => acc + grade.grade, 0) / card.grades.length
      // Calculate weight for the card, higher weight for lower grade card
      const weight = 6 - averageGrade

      // Add the card to the selection pool `weight` times
      for (let i = 0; i < weight; i++) {
        selectionPool.push(card)
      }
    })

    return selectionPool[Math.floor(Math.random() * selectionPool.length)]
  }

  private async getNotDuplicateRandomCard(
    cards: Array<CardWithGrades>,
    previousCardId: string
  ): Promise<CardWithGrades> {
    const randomCard = await this.getSmartRandomCard(cards)

    if (!randomCard) {
      this.logger.error(`No cards found in deck}`, {
        previousCardId,
        randomCard,
        cards,
      })
      throw new NotFoundException(`No cards found in deck`)
    }
    if (randomCard.id === previousCardId && cards.length !== 1) {
      return this.getNotDuplicateRandomCard(cards, previousCardId)
    }

    return randomCard
  }

  async getRandomCardInDeck(deckId: string, userId: string, previousCardId: string) {
    const cards = await this.findCardsByDeckIdWithGrade(userId, deckId)

    if (!cards.length) {
      throw new NotFoundException(`No cards found in deck with id ${deckId}`)
    }

    const smartRandomCard = await this.getNotDuplicateRandomCard(cards, previousCardId)

    return {
      ...pick(smartRandomCard, [
        'id',
        'question',
        'answer',
        'deckId',
        'questionImg',
        'answerImg',
        'questionVideo',
        'answerVideo',
        'created',
        'updated',
        'shots',
      ]),
      grade: smartRandomCard.grades[0]?.grade || 0,
    }
  }
}
