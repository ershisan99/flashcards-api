import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { GetAllCardsInDeckDto } from '../../cards/dto'
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

  async execute(command: GetAllCardsInDeckCommand) {
    const deck = await this.decksRepository.findDeckById(command.deckId)

    if (!deck) throw new NotFoundException(`Deck with id ${command.deckId} not found`)

    if (deck.userId !== command.userId && deck.isPrivate) {
      throw new ForbiddenException(`You can't get a private deck that you don't own`)
    }

    return await this.cardsRepository.findCardsByDeckId(command.deckId, command.params)
  }
}
