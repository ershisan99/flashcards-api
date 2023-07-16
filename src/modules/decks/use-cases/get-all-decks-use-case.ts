import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DecksRepository } from '../infrastructure/decks.repository'
import { GetAllDecksDto } from '../dto'

export class GetAllDecksCommand {
  constructor(public readonly params: GetAllDecksDto) {}
}

@CommandHandler(GetAllDecksCommand)
export class GetAllDecksHandler implements ICommandHandler<GetAllDecksCommand> {
  constructor(private readonly deckRepository: DecksRepository) {}

  async execute(command: GetAllDecksCommand) {
    return await this.deckRepository.findAllDecks(command.params)
  }
}
