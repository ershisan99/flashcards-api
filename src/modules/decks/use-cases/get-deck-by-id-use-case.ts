import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { DecksRepository } from '../infrastructure/decks.repository'

export class GetDeckByIdCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(GetDeckByIdCommand)
export class GetDeckByIdHandler implements ICommandHandler<GetDeckByIdCommand> {
  constructor(private readonly deckRepository: DecksRepository) {}

  async execute(command: GetDeckByIdCommand) {
    return await this.deckRepository.findDeckById(command.id)
  }
}
