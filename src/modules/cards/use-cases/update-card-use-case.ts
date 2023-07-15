import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CardsRepository } from '../infrastructure/cards.repository'
import { UpdateCardDto } from '../dto/update-card.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'

export class UpdateCardCommand {
  constructor(
    public readonly cardId: string,
    public readonly card: UpdateCardDto,
    public readonly userId: string
  ) {}
}

@CommandHandler(UpdateCardCommand)
export class UpdateCardHandler implements ICommandHandler<UpdateCardCommand> {
  constructor(private readonly cardsRepository: CardsRepository) {}

  async execute(command: UpdateCardCommand) {
    const card = await this.cardsRepository.findCardById(command.cardId)

    if (!card) throw new NotFoundException(`Card with id ${command.cardId} not found`)

    if (card.userId !== command.userId) {
      throw new BadRequestException(`You can't change a card that you don't own`)
    }

    return await this.cardsRepository.updateCardById(command.cardId, command.card)
  }
}
