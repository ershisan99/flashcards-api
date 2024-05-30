import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { DecksRepository } from '../infrastructure/decks.repository'

export class RemoveDeckFromFavoritesCommand {
  constructor(
    public readonly userId: string,
    public readonly deckId: string
  ) {}
}

@CommandHandler(RemoveDeckFromFavoritesCommand)
export class RemoveDeckFromFavoritesHandler
  implements ICommandHandler<RemoveDeckFromFavoritesCommand>
{
  constructor(private readonly decksRepository: DecksRepository) {}

  async execute(command: RemoveDeckFromFavoritesCommand): Promise<void> {
    const deck = await this.decksRepository.findDeckById(command.deckId)

    if (!deck) {
      throw new NotFoundException(`Deck with id ${command.deckId} not found`)
    }
    const favorites = await this.decksRepository.findFavoritesByUserId(
      command.userId,
      command.deckId
    )

    if (!favorites?.includes(command.deckId)) {
      throw new BadRequestException(`Deck with id ${command.deckId} is not a favorite`)
    }

    return await this.decksRepository.removeDeckFromFavorites(command.userId, command.deckId)
  }
}
