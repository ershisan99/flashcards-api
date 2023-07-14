import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CardsRepository } from '../infrastructure/cards.repository'
import { BadRequestException, NotFoundException } from '@nestjs/common'

export class DeleteCardByIdCommand {
  constructor(public readonly id: string, public readonly userId: string) {}
}

@CommandHandler(DeleteCardByIdCommand)
export class DeleteCardByIdHandler implements ICommandHandler<DeleteCardByIdCommand> {
  constructor(private readonly cardsRepository: CardsRepository) {}

  async execute(command: DeleteCardByIdCommand) {
    const card = await this.cardsRepository.findCardById(command.id)
    if (!card) throw new NotFoundException(`Card with id ${command.id} not found`)
    if (card.userId !== command.userId) {
      throw new BadRequestException(`You can't delete a card that you don't own`)
    }
    return await this.cardsRepository.deleteCardById(command.id)
  }
}
