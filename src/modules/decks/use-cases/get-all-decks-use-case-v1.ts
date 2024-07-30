import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { GetAllDecksDto } from '../dto'
import { PaginatedDecksWithMaxCardsCount } from '../entities/deck.entity'
import { DecksRepository } from '../infrastructure/decks.repository'

export class GetAllDecksV1Command {
  constructor(public readonly params: GetAllDecksDto) {}
}

@CommandHandler(GetAllDecksV1Command)
export class GetAllDecksV1Handler implements ICommandHandler<GetAllDecksV1Command> {
  constructor(private readonly deckRepository: DecksRepository) {}

  async execute(command: GetAllDecksV1Command): Promise<PaginatedDecksWithMaxCardsCount> {
    const decks = await this.deckRepository.findAllDecks(command.params)
    const minMax = await this.deckRepository.findMinMaxCards({})

    return { ...decks, maxCardsCount: minMax.max }
  }
}
