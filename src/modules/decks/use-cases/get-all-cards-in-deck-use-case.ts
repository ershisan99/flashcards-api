import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CardsRepository } from '../../cards/infrastructure/cards.repository'
import { GetAllCardsInDeckDto } from '../../cards/dto/get-all-cards.dto'
import { ForbiddenException, NotFoundException } from '@nestjs/common'

export class GetAllCardsInDeckCommand {
  constructor(
    public readonly userId: string,
    public readonly deckId: string,
    public readonly params: GetAllCardsInDeckDto
  ) {}
}

@CommandHandler(GetAllCardsInDeckCommand)
export class GetAllCardsInDeckHandler implements ICommandHandler<GetAllCardsInDeckCommand> {
  constructor(private readonly cardsRepository: CardsRepository) {}

  async execute(command: GetAllCardsInDeckCommand) {
    const deck = await this.cardsRepository.findDeckById(command.deckId)
    if (!deck) throw new NotFoundException(`Deck with id ${command.deckId} not found`)

    if (deck.userId !== command.userId && deck.isPrivate) {
      throw new ForbiddenException(`You can't get a private deck that you don't own`)
    }

    return await this.cardsRepository.findCardsByDeckId(command.deckId, command.params)
  }
}
