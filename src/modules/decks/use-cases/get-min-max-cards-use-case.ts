import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { ResendVerificationEmailDto } from '../../auth/dto'
import { MinMaxCards } from '../entities/min-max-cards.entity'
import { DecksRepository } from '../infrastructure/decks.repository'

export class GetMinMaxCardsUseCaseCommand {
  constructor(public readonly args: ResendVerificationEmailDto) {}
}

@CommandHandler(GetMinMaxCardsUseCaseCommand)
export class GetMinMaxCardsUseCaseHandler implements ICommandHandler<GetMinMaxCardsUseCaseCommand> {
  constructor(private readonly deckRepository: DecksRepository) {}

  async execute(command: GetMinMaxCardsUseCaseCommand): Promise<MinMaxCards> {
    return await this.deckRepository.findMinMaxCards(command.args)
  }
}
