import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DecksRepository } from '../infrastructure/decks.repository'
import { UpdateDeckDto } from '../dto/update-deck.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'

export class UpdateDeckCommand {
  constructor(
    public readonly deckId: string,
    public readonly deck: UpdateDeckDto,
    public readonly userId: string
  ) {}
}

@CommandHandler(UpdateDeckCommand)
export class UpdateDeckHandler implements ICommandHandler<UpdateDeckCommand> {
  constructor(private readonly deckRepository: DecksRepository) {}

  async execute(command: UpdateDeckCommand) {
    const deck = await this.deckRepository.findDeckById(command.deckId)
    if (!deck) {
      throw new NotFoundException(`Deck with id ${command.deckId} not found`)
    }

    if (deck.userId !== command.userId) {
      throw new BadRequestException(`You can't modify a deck that you don't own`)
    }

    return await this.deckRepository.updateDeckById(command.deckId, command.deck)
  }
}
