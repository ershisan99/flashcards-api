import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { CardsRepository } from '../../cards/infrastructure/cards.repository'
import { DecksRepository } from '../infrastructure/decks.repository'

export class GetRandomCardInDeckCommand {
  constructor(
    public readonly userId: string,
    public readonly deckId: string,
    public readonly previousCardId: string
  ) {}
}

@CommandHandler(GetRandomCardInDeckCommand)
export class GetRandomCardInDeckHandler implements ICommandHandler<GetRandomCardInDeckCommand> {
  logger = new Logger(GetRandomCardInDeckHandler.name)

  constructor(
    private readonly cardsRepository: CardsRepository,
    private readonly decksRepository: DecksRepository
  ) {}

  async execute(command: GetRandomCardInDeckCommand) {
    const deck = await this.decksRepository.findDeckById(command.deckId)

    if (!deck) throw new NotFoundException(`Deck with id ${command.deckId} not found`)

    if (deck.userId !== command.userId && deck.isPrivate) {
      throw new ForbiddenException(`You can't get a private deck that you don't own`)
    }

    return await this.cardsRepository.getRandomCardInDeck(
      command.deckId,
      command.userId,
      command.previousCardId
    )
  }
}
