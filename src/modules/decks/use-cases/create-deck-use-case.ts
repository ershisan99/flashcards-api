import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateDeckDto } from '../dto/create-deck.dto'
import { DecksRepository } from '../infrastructure/decks.repository'

export class CreateDeckCommand {
  constructor(public readonly deck: CreateDeckDto) {}
}

@CommandHandler(CreateDeckCommand)
export class CreateDeckHandler implements ICommandHandler<CreateDeckCommand> {
  constructor(private readonly deckRepository: DecksRepository) {}

  async execute(command: CreateDeckCommand) {
    return await this.deckRepository.createDeck(command.deck)
  }
}
