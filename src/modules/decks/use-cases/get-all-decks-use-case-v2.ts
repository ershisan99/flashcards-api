import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { GetAllDecksDto } from '../dto'
import { PaginatedDecks } from '../entities/deck.entity'
import { DecksRepository } from '../infrastructure/decks.repository'

export class GetAllDecksV2Command {
  constructor(public readonly params: GetAllDecksDto & { isAdmin?: boolean }) {}
}

@CommandHandler(GetAllDecksV2Command)
export class GetAllDecksV2Handler implements ICommandHandler<GetAllDecksV2Command> {
  constructor(private readonly deckRepository: DecksRepository) {}

  async execute(command: GetAllDecksV2Command): Promise<PaginatedDecks> {
    if (command.params.isAdmin)
      return (await this.deckRepository.findAllDecksForAdmin(command.params)) as any

    return await this.deckRepository.findAllDecks(command.params)
  }
}
