import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { FileUploadService } from '../../../infrastructure/file-upload-service/file-upload.service'
import { UpdateDeckDto } from '../dto'
import { Deck } from '../entities/deck.entity'
import { DecksRepository } from '../infrastructure/decks.repository'

export class UpdateDeckCommand {
  constructor(
    public readonly deckId: string,
    public readonly deck: UpdateDeckDto,
    public readonly userId: string,
    public readonly cover: Express.Multer.File
  ) {}
}

@CommandHandler(UpdateDeckCommand)
export class UpdateDeckHandler implements ICommandHandler<UpdateDeckCommand> {
  constructor(
    private readonly deckRepository: DecksRepository,
    private readonly fileUploadService: FileUploadService
  ) {}

  async execute(command: UpdateDeckCommand): Promise<Deck> {
    const deck = await this.deckRepository.findDeckById(command.deckId)

    if (!deck) {
      throw new NotFoundException(`Deck with id ${command.deckId} not found`)
    }

    if (deck.userId !== command.userId) {
      throw new BadRequestException(`You can't modify a deck that you don't own`)
    }
    let cover

    if (command.cover) {
      const result = await this.fileUploadService.uploadFile(
        command.cover.buffer,
        command.cover.originalname
      )

      cover = result.fileUrl
    } else if (command.deck.cover === '') {
      cover = null
    }

    return await this.deckRepository.updateDeckById(command.deckId, { ...command.deck, cover })
  }
}
