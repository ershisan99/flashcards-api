import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { DecksRepository } from '../infrastructure/decks.repository'

export class AddDeckToFavoritesCommand {
  constructor(
    public readonly userId: string,
    public readonly deckId: string
  ) {}
}

@CommandHandler(AddDeckToFavoritesCommand)
export class AddDeckToFavoritesHandler implements ICommandHandler<AddDeckToFavoritesCommand> {
  constructor(private readonly decksRepository: DecksRepository) {}

  async execute(command: AddDeckToFavoritesCommand): Promise<void> {
    const deck = await this.decksRepository.findDeckById(command.deckId)

    if (!deck) {
      throw new NotFoundException(`Deck with id ${command.deckId} not found`)
    }
    const favorites = await this.decksRepository.findFavoritesByUserId(
      command.userId,
      command.deckId
    )

    if (favorites?.includes(command.deckId)) {
      throw new ForbiddenException(`You can't add a deck that you already have in favorites`)
    }

    return await this.decksRepository.addDeckToFavorites(command.userId, command.deckId)
  }
}
