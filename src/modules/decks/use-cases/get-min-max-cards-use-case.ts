import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { MinMaxCards } from '../entities/min-max-cards.entity'
import { DecksRepository } from '../infrastructure/decks.repository'

export class GetMinMaxCardsUseCaseCommand {
  constructor() {}
}

@CommandHandler(GetMinMaxCardsUseCaseCommand)
export class GetMinMaxCardsUseCaseHandler implements ICommandHandler<GetMinMaxCardsUseCaseCommand> {
  constructor(private readonly deckRepository: DecksRepository) {}

  async execute(): Promise<MinMaxCards> {
    return await this.deckRepository.findMinMaxCards()
  }
}
