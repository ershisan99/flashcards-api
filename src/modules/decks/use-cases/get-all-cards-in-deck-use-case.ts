import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { pick } from 'remeda'

import { GetAllCardsInDeckDto } from '../../cards/dto'
import {
  PaginatedCards,
  PaginatedCardsWithGrade,
  PaginatedCardsWithGrades,
} from '../../cards/entities/cards.entity'
import { CardsRepository } from '../../cards/infrastructure/cards.repository'
import { DecksRepository } from '../infrastructure/decks.repository'

export class GetAllCardsInDeckCommand {
  constructor(
    public readonly userId: string,
    public readonly deckId: string,
    public readonly params: GetAllCardsInDeckDto
  ) {}
}

@CommandHandler(GetAllCardsInDeckCommand)
export class GetAllCardsInDeckHandler implements ICommandHandler<GetAllCardsInDeckCommand> {
  constructor(
    private readonly cardsRepository: CardsRepository,
    private readonly decksRepository: DecksRepository
  ) {}

  private transformGrade(cards: PaginatedCardsWithGrades): PaginatedCardsWithGrade {
    return {
      ...cards,
      items: cards.items.map(card =>
        pick(
          {
            ...card,
            grade: card.grades[0]?.grade || 0,
          },
          [
            'answer',
            'answerImg',
            'answerVideo',
            'created',
            'deckId',
            'grade',
            'id',
            'question',
            'questionImg',
            'questionVideo',
            'shots',
            'updated',
            'userId',
          ]
        )
      ),
    }
  }

  async execute(command: GetAllCardsInDeckCommand): Promise<PaginatedCards> {
    const deck = await this.decksRepository.findDeckById(command.deckId, command.userId)

    if (!deck) throw new NotFoundException(`Deck with id ${command.deckId} not found`)

    if (deck.userId !== command.userId && deck.isPrivate) {
      throw new ForbiddenException(`You can't get a private deck that you don't own`)
    }
    const cards = await this.cardsRepository.findCardsByDeckId(
      command.deckId,
      command.userId,
      command.params
    )

    return this.transformGrade(cards)
  }
}
