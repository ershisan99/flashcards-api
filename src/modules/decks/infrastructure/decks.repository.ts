import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { omit } from 'remeda'

import { PrismaService } from '../../../prisma.service'
import { DecksOrderBy, GetAllDecksDto } from '../dto'
import { Deck, PaginatedDecks } from '../entities/deck.entity'

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
  }): Promise<Deck> {
    try {
      const result = await this.prisma.deck.create({
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
        include: {
          _count: {
            select: {
              card: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return { ...result, cardsCount: result._count.card }
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  async findMinMaxCards(): Promise<{ min: number; max: number }> {
    const result = await this.prisma
      .$queryRaw`SELECT MAX(card_count) as "maxCardsCount", MIN(card_count) as "minCardsCount" FROM (SELECT deck.id, COUNT(card.id) as card_count FROM flashcards.deck LEFT JOIN "flashcards"."card" ON deck.id = card."deckId" GROUP BY deck.id) AS card_counts;`

    return {
      max: Number(result[0].maxCardsCount),
      min: Number(result[0].minCardsCount),
    }
  }

  async findAllDecksForAdmin({
    name = undefined,
    authorId = undefined,
    favoritedBy = undefined,
    userId,
    currentPage,
    itemsPerPage,
    minCardsCount,
    maxCardsCount,
    orderBy,
  }: GetAllDecksDto): Promise<PaginatedDecks> {
    if (!orderBy || orderBy === 'null') {
      orderBy = DecksOrderBy['updated-desc']
    }
    if (authorId === '~caller') authorId = userId
    if (favoritedBy === '~caller') favoritedBy = userId

    let orderField = 'd.updated' // default order field
    let orderDirection = 'DESC' // default order direction

    if (orderBy) {
      const orderByParts = orderBy.split('-')

      if (orderByParts.length === 2) {
        const field = orderByParts[0]
        const direction = orderByParts[1].toUpperCase()

        // Validate the field and direction
        if (
          ['cardsCount', 'updated', 'name', 'author.name', 'created'].includes(field) &&
          ['ASC', 'DESC'].includes(direction)
        ) {
          if (field === 'cardsCount') {
            orderField = '"cardsCount"'
          } else if (field === 'author.name') {
            orderField = 'a.name'
          } else {
            orderField = `d.${field}`
          }

          orderDirection = direction
        }
      }
    }
    try {
      // Prepare the where clause conditions
      const conditions = []

      if (name) conditions.push(`d.name ILIKE ('%' || ? || '%')`)
      if (authorId) conditions.push(`d."userId" = ?`)
      if (userId) conditions.push(`(d."isPrivate" = FALSE OR (d."isPrivate" = TRUE))`)
      if (favoritedBy) conditions.push(`fd."userId" = ?`)

      // Prepare the having clause for card count range
      const havingConditions = []

      if (minCardsCount != null) havingConditions.push(`COUNT(c.id) >= ?`)
      if (maxCardsCount != null) havingConditions.push(`COUNT(c.id) <= ?`)

      // Construct the raw SQL query for fetching decks
      const query = `
    SELECT 
      d.*, 
      COUNT(c.id) AS "cardsCount",
      a."id" AS "authorId",
      a."name" AS "authorName",
      (fd."userId" IS NOT NULL) AS "isFavorite"
    FROM flashcards.deck AS "d"
    LEFT JOIN "flashcards"."card" AS c ON d."id" = c."deckId"
    LEFT JOIN "flashcards"."user" AS a ON d."userId" = a.id
    LEFT JOIN "flashcards"."favoriteDeck" AS fd ON d."id" = fd."deckId" AND fd."userId" = $1
    ${
      conditions.length
        ? `WHERE ${conditions
            .map((condition, index) => `${condition.replace('?', `$${index + 2}`)}`)
            .join(' AND ')}`
        : ''
    }
    GROUP BY d."id", a."id", fd."userId"
    ${
      havingConditions.length
        ? `HAVING ${havingConditions
            .map(
              (condition, index) => `${condition.replace('?', `$${conditions.length + index + 2}`)}`
            )
            .join(' AND ')}`
        : ''
    }
    ORDER BY ${orderField} ${orderDirection} 
    LIMIT $${conditions.length + havingConditions.length + 2} OFFSET $${
      conditions.length + havingConditions.length + 3
    };
  `

      // Parameters for fetching decks
      const deckQueryParams = [
        userId,
        ...(name ? [name] : []),
        ...(authorId ? [authorId] : []),
        ...(userId ? [userId] : []),
        ...(favoritedBy ? [favoritedBy] : []),
        ...(minCardsCount != null ? [minCardsCount] : []),
        ...(maxCardsCount != null ? [maxCardsCount] : []),
        itemsPerPage,
        (currentPage - 1) * itemsPerPage,
      ]

      // Execute the raw SQL query for fetching decks
      const decks = await this.prisma.$queryRawUnsafe<
        Array<
          Deck & {
            authorId: string
            authorName: string
            isFavorite: boolean
          }
        >
      >(query, ...deckQueryParams)

      // Construct the raw SQL query for total count
      const countQuery = `
    SELECT COUNT(*) AS total
    FROM (
        SELECT d.id
        FROM flashcards.deck AS d
        LEFT JOIN flashcards.card AS c ON d.id = c."deckId"
        LEFT JOIN flashcards."favoriteDeck" AS fd ON d."id" = fd."deckId" AND fd."userId" = $1
        ${
          conditions.length
            ? `WHERE ${conditions
                .map((condition, index) => `${condition.replace('?', `$${index + 2}`)}`)
                .join(' AND ')}`
            : ''
        }
        GROUP BY d.id, fd."userId"
        ${
          havingConditions.length
            ? `HAVING ${havingConditions
                .map(
                  (condition, index) =>
                    `${condition.replace('?', `$${conditions.length + index + 2}`)}`
                )
                .join(' AND ')}`
            : ''
        }
    ) AS subquery;
  `

      // Parameters for total count query
      const countQueryParams = [
        userId,
        ...(name ? [name] : []),
        ...(authorId ? [authorId] : []),
        ...(userId ? [userId] : []),
        ...(favoritedBy ? [favoritedBy] : []),
        ...(minCardsCount != null ? [minCardsCount] : []),
        ...(maxCardsCount != null ? [maxCardsCount] : []),
      ]

      // Execute the raw SQL query for total count
      const totalResult = await this.prisma.$queryRawUnsafe<any[]>(countQuery, ...countQueryParams)
      const total = Number(totalResult[0]?.total) ?? 1

      const modifiedDecks = decks.map(deck => {
        const cardsCount = deck.cardsCount

        return omit(
          {
            ...deck,
            cardsCount: typeof cardsCount === 'bigint' ? Number(cardsCount) : cardsCount,
            isPrivate: !!deck.isPrivate,
            author: {
              id: deck.authorId,
              name: deck.authorName,
            },
          },
          ['authorId', 'authorName']
        )
      })

      // Return the result with pagination data
      return {
        items: modifiedDecks,
        pagination: {
          totalItems: total,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(total / itemsPerPage),
        },
      }
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  async findAllDecks({
    name = undefined,
    authorId = undefined,
    favoritedBy = undefined,
    userId,
    currentPage,
    itemsPerPage,
    minCardsCount,
    maxCardsCount,
    orderBy,
  }: GetAllDecksDto): Promise<PaginatedDecks> {
    if (!orderBy || orderBy === 'null') {
      orderBy = DecksOrderBy['updated-desc']
    }
    if (authorId === '~caller') authorId = userId
    if (favoritedBy === '~caller') favoritedBy = userId

    let orderField = 'd.updated' // default order field
    let orderDirection = 'DESC' // default order direction

    if (orderBy) {
      const orderByParts = orderBy.split('-')

      if (orderByParts.length === 2) {
        const field = orderByParts[0]
        const direction = orderByParts[1].toUpperCase()

        // Validate the field and direction
        if (
          ['cardsCount', 'updated', 'name', 'author.name', 'created'].includes(field) &&
          ['ASC', 'DESC'].includes(direction)
        ) {
          if (field === 'cardsCount') {
            orderField = '"cardsCount"'
          } else if (field === 'author.name') {
            orderField = 'a.name'
          } else {
            orderField = `d.${field}`
          }

          orderDirection = direction
        }
      }
    }
    try {
      // Prepare the where clause conditions
      const conditions = []

      if (name) conditions.push(`d.name ILIKE ('%' || ? || '%')`)
      if (authorId) conditions.push(`d."userId" = ?`)
      if (userId)
        conditions.push(`(d."isPrivate" = FALSE OR (d."isPrivate" = TRUE AND d."userId" = ?))`)
      if (favoritedBy) conditions.push(`fd."userId" = ?`)

      // Prepare the having clause for card count range
      const havingConditions = []

      if (minCardsCount != null) havingConditions.push(`COUNT(c.id) >= ?`)
      if (maxCardsCount != null) havingConditions.push(`COUNT(c.id) <= ?`)

      // Construct the raw SQL query for fetching decks
      const query = `
    SELECT 
      d.*, 
      COUNT(c.id) AS "cardsCount",
      a."id" AS "authorId",
      a."name" AS "authorName",
      (fd."userId" IS NOT NULL) AS "isFavorite"
    FROM flashcards.deck AS "d"
    LEFT JOIN "flashcards"."card" AS c ON d."id" = c."deckId"
    LEFT JOIN "flashcards"."user" AS a ON d."userId" = a.id
    LEFT JOIN "flashcards"."favoriteDeck" AS fd ON d."id" = fd."deckId" AND fd."userId" = $1
    ${
      conditions.length
        ? `WHERE ${conditions
            .map((condition, index) => `${condition.replace('?', `$${index + 2}`)}`)
            .join(' AND ')}`
        : ''
    }
    GROUP BY d."id", a."id", fd."userId"
    ${
      havingConditions.length
        ? `HAVING ${havingConditions
            .map(
              (condition, index) => `${condition.replace('?', `$${conditions.length + index + 2}`)}`
            )
            .join(' AND ')}`
        : ''
    }
    ORDER BY ${orderField} ${orderDirection} 
    LIMIT $${conditions.length + havingConditions.length + 2} OFFSET $${
      conditions.length + havingConditions.length + 3
    };
  `

      // Parameters for fetching decks
      const deckQueryParams = [
        userId,
        ...(name ? [name] : []),
        ...(authorId ? [authorId] : []),
        ...(userId ? [userId] : []),
        ...(favoritedBy ? [favoritedBy] : []),
        ...(minCardsCount != null ? [minCardsCount] : []),
        ...(maxCardsCount != null ? [maxCardsCount] : []),
        itemsPerPage,
        (currentPage - 1) * itemsPerPage,
      ]

      // Execute the raw SQL query for fetching decks
      const decks = await this.prisma.$queryRawUnsafe<
        Array<
          Deck & {
            authorId: string
            authorName: string
            isFavorite: boolean
          }
        >
      >(query, ...deckQueryParams)

      // Construct the raw SQL query for total count
      const countQuery = `
    SELECT COUNT(*) AS total
    FROM (
        SELECT d.id
        FROM flashcards.deck AS d
        LEFT JOIN flashcards.card AS c ON d.id = c."deckId"
        LEFT JOIN flashcards."favoriteDeck" AS fd ON d."id" = fd."deckId" AND fd."userId" = $1
        ${
          conditions.length
            ? `WHERE ${conditions
                .map((condition, index) => `${condition.replace('?', `$${index + 2}`)}`)
                .join(' AND ')}`
            : ''
        }
        GROUP BY d.id, fd."userId"
        ${
          havingConditions.length
            ? `HAVING ${havingConditions
                .map(
                  (condition, index) =>
                    `${condition.replace('?', `$${conditions.length + index + 2}`)}`
                )
                .join(' AND ')}`
            : ''
        }
    ) AS subquery;
  `

      // Parameters for total count query
      const countQueryParams = [
        userId,
        ...(name ? [name] : []),
        ...(authorId ? [authorId] : []),
        ...(userId ? [userId] : []),
        ...(favoritedBy ? [favoritedBy] : []),
        ...(minCardsCount != null ? [minCardsCount] : []),
        ...(maxCardsCount != null ? [maxCardsCount] : []),
      ]

      // Execute the raw SQL query for total count
      const totalResult = await this.prisma.$queryRawUnsafe<any[]>(countQuery, ...countQueryParams)
      const total = Number(totalResult[0]?.total) ?? 1

      const modifiedDecks = decks.map(deck => {
        const cardsCount = deck.cardsCount

        return omit(
          {
            ...deck,
            cardsCount: typeof cardsCount === 'bigint' ? Number(cardsCount) : cardsCount,
            isPrivate: !!deck.isPrivate,
            author: {
              id: deck.authorId,
              name: deck.authorName,
            },
          },
          ['authorId', 'authorName']
        )
      })

      // Return the result with pagination data
      return {
        items: modifiedDecks,
        pagination: {
          totalItems: total,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(total / itemsPerPage),
        },
      }
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  public async findDeckById(id: string, userId: string): Promise<any> {
    try {
      const result = await this.prisma.deck.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              card: true,
            },
          },
          favoritedBy: {
            where: {
              userId,
            },
          },
        },
      })

      const isFavorite = result.favoritedBy.length > 0

      return omit({ ...result, cardsCount: result._count.card, isFavorite }, [
        '_count',
        'favoritedBy',
      ])
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  public async findDeckByCardId(cardId: string): Promise<Deck> {
    try {
      const card = await this.prisma.card.findUnique({
        where: {
          id: cardId,
        },
      })

      if (!card) return null

      const result = await this.prisma.deck.findUnique({
        include: {
          _count: {
            select: {
              card: true,
            },
          },
        },
        where: {
          id: card.deckId,
        },
      })

      return { ...result, cardsCount: result._count.card }
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  public async deleteManyById(id: string[]) {
    try {
      return await this.prisma.deck.deleteMany({
        where: {
          id: {
            in: id,
          },
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

  async findFavoritesByUserId(userId: string, deckId?: string): Promise<Array<string>> {
    try {
      const favorites = await this.prisma.favoriteDeck.findMany({
        where: {
          userId: userId,
          ...{ deckId: deckId ? deckId : undefined },
        },
        select: {
          deckId: true,
        },
      })

      return favorites.map(favorite => favorite.deckId)
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  async addDeckToFavorites(userId: string, deckId: string): Promise<void> {
    try {
      await this.prisma.favoriteDeck.create({
        data: {
          userId: userId,
          deckId: deckId,
        },
      })
    } catch (e) {
      // Handle the case where the favorite already exists or any other error
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  async removeDeckFromFavorites(userId: string, deckId: string): Promise<void> {
    try {
      await this.prisma.favoriteDeck.delete({
        where: {
          userId_deckId: {
            userId: userId,
            deckId: deckId,
          },
        },
      })
    } catch (e) {
      // Handle the case where the favorite does not exist or any other error
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }

  public async updateDeckById(
    id: string,
    data: { name?: string; cover?: string; isPrivate?: boolean }
  ): Promise<Deck> {
    try {
      const result = await this.prisma.deck.update({
        where: {
          id,
        },
        data,
        include: {
          _count: {
            select: {
              card: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return { ...result, cardsCount: result._count.card }
    } catch (e) {
      this.logger.error(e?.message)
      throw new InternalServerErrorException(e?.message)
    }
  }
}
