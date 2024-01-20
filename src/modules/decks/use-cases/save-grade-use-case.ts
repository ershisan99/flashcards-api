import {
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { CardsRepository } from '../../cards/infrastructure/cards.repository'
import { DecksRepository } from '../infrastructure/decks.repository'
import { GradesRepository } from '../infrastructure/grades.repository'

export class SaveGradeCommand {
  constructor(
    public readonly userId: string,
    public readonly args: {
      cardId: string
      grade: number
    }
  ) {}
}

@CommandHandler(SaveGradeCommand)
export class SaveGradeHandler implements ICommandHandler<SaveGradeCommand> {
  private readonly logger = new Logger(SaveGradeHandler.name)

  constructor(
    private readonly decksRepository: DecksRepository,
    private readonly gradesRepository: GradesRepository,
    private readonly cardsRepository: CardsRepository
  ) {}

  async execute(command: SaveGradeCommand) {
    const deck = await this.decksRepository.findDeckByCardId(command.args.cardId)

    if (!deck)
      throw new NotFoundException(`Deck containing card with id ${command.args.cardId} not found`)

    if (deck.userId !== command.userId && deck.isPrivate) {
      throw new ForbiddenException(`You can't save cards to a private deck that you don't own`)
    }

    try {
      await this.gradesRepository.createGrade({
        userId: command.userId,
        grade: command.args.grade,
        cardId: command.args.cardId,
        deckId: deck.id,
      })
    } catch (e) {
      this.logger.error(e)
      throw new InternalServerErrorException(e?.message)
    }

    return this.cardsRepository.getRandomCardInDeck(deck.id, command.userId, command.args.cardId)
  }
}
