import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateCardDto } from '../../cards/dto/create-card.dto'
import { CardsRepository } from '../../cards/infrastructure/cards.repository'

export class CreateCardCommand {
  constructor(
    public readonly userId: string,
    public readonly deckId: string,
    public readonly card: CreateCardDto
  ) {}
}

@CommandHandler(CreateCardCommand)
export class CreateCardHandler implements ICommandHandler<CreateCardCommand> {
  constructor(private readonly cardsRepository: CardsRepository) {}

  async execute(command: CreateCardCommand) {
    return await this.cardsRepository.createCard(command.deckId, command.userId, command.card)
  }
}
