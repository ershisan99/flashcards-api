import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { FileUploadService } from '../../../infrastructure/file-upload-service/file-upload.service'
import { CreateCardDto } from '../../cards/dto'
import { Card } from '../../cards/entities/cards.entity'
import { CardsRepository } from '../../cards/infrastructure/cards.repository'
import { DecksRepository } from '../infrastructure/decks.repository'

export class CreateCardCommand {
  constructor(
    public readonly userId: string,
    public readonly deckId: string,
    public readonly card: CreateCardDto,
    public readonly answerImg?: Express.Multer.File,
    public readonly questionImg?: Express.Multer.File
  ) {}
}

@CommandHandler(CreateCardCommand)
export class CreateCardHandler implements ICommandHandler<CreateCardCommand> {
  constructor(
    private readonly cardsRepository: CardsRepository,
    private readonly decksRepository: DecksRepository,
    private readonly fileUploadService: FileUploadService
  ) {}

  async execute(command: CreateCardCommand): Promise<Card> {
    let questionImg, answerImg

    const deck = await this.decksRepository.findDeckById(command.deckId)

    if (!deck) {
      throw new NotFoundException(`Deck with id ${command.deckId} not found`)
    }
    if (deck.userId !== command.userId) {
      throw new ForbiddenException(`You can't create cards in a deck that you don't own`)
    }

    if (command.questionImg && command.answerImg) {
      const addQuestionImagePromise = this.fileUploadService.uploadFile(
        command.questionImg?.buffer,
        command.questionImg?.originalname
      )
      const addAnswerImagePromise = this.fileUploadService.uploadFile(
        command.answerImg?.buffer,
        command.answerImg?.originalname
      )

      const result = await Promise.all([addQuestionImagePromise, addAnswerImagePromise])

      questionImg = result[0].fileUrl
      answerImg = result[1].fileUrl
    } else if (command.answerImg) {
      const addAnswerImagePromise = this.fileUploadService.uploadFile(
        command.answerImg?.buffer,
        command.answerImg?.originalname
      )
      const result = await addAnswerImagePromise

      answerImg = result.fileUrl
    } else if (command.questionImg) {
      const addQuestionImagePromise = this.fileUploadService.uploadFile(
        command.questionImg?.buffer,
        command.questionImg?.originalname
      )
      const result = await addQuestionImagePromise

      questionImg = result.fileUrl
    }
    if (command.card.questionImg === '') {
      questionImg = null
    }
    if (command.card.answerImg === '') {
      answerImg = null
    }

    return await this.cardsRepository.createCard(command.deckId, command.userId, {
      ...command.card,
      questionImg,
      answerImg,
    })
  }
}
