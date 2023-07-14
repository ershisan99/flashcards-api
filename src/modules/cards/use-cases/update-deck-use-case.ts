import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CardsRepository } from '../infrastructure/cards.repository'
import { UpdateCardDto } from '../dto/update-card.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'

export class UpdateDeckCommand {
  constructor(
    public readonly deckId: string,
    public readonly deck: UpdateCardDto,
    public readonly userId: string
  ) {}
}

@CommandHandler(UpdateDeckCommand)
export class UpdateDeckHandler implements ICommandHandler<UpdateDeckCommand> {
  constructor(private readonly deckRepository: CardsRepository) {}

  async execute(command: UpdateDeckCommand) {
    const deck = await this.deckRepository.findCardById(command.deckId)

    if (!deck) throw new NotFoundException(`Deck with id ${command.deckId} not found`)

    if (deck.userId !== command.userId) {
      throw new BadRequestException(`You can't change a deck that you don't own`)
    }

    return await this.deckRepository.updateDeckById(command.deckId, command.deck)
  }
}
