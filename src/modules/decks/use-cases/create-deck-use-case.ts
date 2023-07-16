import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { FileUploadService } from '../../../infrastructure/file-upload-service/file-upload.service'
import { CreateDeckDto } from '../dto'
import { Deck } from '../entities/deck.entity'
import { DecksRepository } from '../infrastructure/decks.repository'

export class CreateDeckCommand {
  constructor(public readonly deck: CreateDeckDto, public readonly cover: Express.Multer.File) {}
}

@CommandHandler(CreateDeckCommand)
export class CreateDeckHandler implements ICommandHandler<CreateDeckCommand> {
  constructor(
    private readonly deckRepository: DecksRepository,
    private readonly fileUploadService: FileUploadService
  ) {}

  async execute(command: CreateDeckCommand): Promise<Deck> {
    let cover

    if (command.cover) {
      const result = await this.fileUploadService.uploadFile(
        command.cover.buffer,
        command.cover.originalname
      )

      cover = result.fileUrl
    }

    return await this.deckRepository.createDeck({ ...command.deck, cover })
  }
}
