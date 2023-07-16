import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { GetAllDecksDto } from '../dto'
import { PaginatedDecks } from '../entities/deck.entity'
import { DecksRepository } from '../infrastructure/decks.repository'

export class GetAllDecksCommand {
  constructor(public readonly params: GetAllDecksDto) {}
}

@CommandHandler(GetAllDecksCommand)
export class GetAllDecksHandler implements ICommandHandler<GetAllDecksCommand> {
  constructor(private readonly deckRepository: DecksRepository) {}

  async execute(command: GetAllDecksCommand): Promise<PaginatedDecks> {
    return await this.deckRepository.findAllDecks(command.params)
  }
}
