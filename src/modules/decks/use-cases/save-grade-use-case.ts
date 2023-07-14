import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CardsRepository } from '../../cards/infrastructure/cards.repository'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
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
  constructor(
    private readonly cardsRepository: CardsRepository,
    private readonly decksRepository: DecksRepository,
    private readonly gradesRepository: GradesRepository
  ) {}

  async execute(command: SaveGradeCommand) {
    const deck = await this.decksRepository.findDeckByCardId(command.args.cardId)
    if (!deck)
      throw new NotFoundException(`Deck containing card with id ${command.args.cardId} not found`)

    if (deck.userId !== command.userId && deck.isPrivate) {
      throw new ForbiddenException(`You can't save cards to  a private deck that you don't own`)
    }

    return await this.gradesRepository.createGrade({
      userId: command.userId,
      grade: command.args.grade,
      cardId: command.args.cardId,
      deckId: deck.id,
    })
  }
}
