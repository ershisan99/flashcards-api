import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { CardsRepository } from '../infrastructure/cards.repository'

export class DeleteCardByIdCommand {
  constructor(public readonly id: string, public readonly userId: string) {}
}

@CommandHandler(DeleteCardByIdCommand)
export class DeleteCardByIdHandler implements ICommandHandler<DeleteCardByIdCommand> {
  constructor(private readonly cardsRepository: CardsRepository) {}

  async execute(command: DeleteCardByIdCommand): Promise<void> {
    const card = await this.cardsRepository.findCardById(command.id)

    if (!card) throw new NotFoundException(`Card with id ${command.id} not found`)
    if (card.userId !== command.userId) {
      throw new ForbiddenException(`You can't delete a card that you don't own`)
    }

    await this.cardsRepository.deleteCardById(command.id)
  }
}
