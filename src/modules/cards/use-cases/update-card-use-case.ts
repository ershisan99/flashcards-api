import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CardsRepository } from '../infrastructure/cards.repository'
import { UpdateCardDto } from '../dto/update-card.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { FileUploadService } from '../../../infrastructure/file-upload-service/file-upload.service'

export class UpdateCardCommand {
  constructor(
    public readonly cardId: string,
    public readonly card: UpdateCardDto,
    public readonly userId: string,
    public readonly answerImg?: Express.Multer.File,
    public readonly questionImg?: Express.Multer.File
  ) {}
}

@CommandHandler(UpdateCardCommand)
export class UpdateCardHandler implements ICommandHandler<UpdateCardCommand> {
  constructor(
    private readonly cardsRepository: CardsRepository,
    private readonly fileUploadService: FileUploadService
  ) {}

  async execute(command: UpdateCardCommand) {
    const card = await this.cardsRepository.findCardById(command.cardId)

    if (!card) throw new NotFoundException(`Card with id ${command.cardId} not found`)

    if (card.userId !== command.userId) {
      throw new BadRequestException(`You can't change a card that you don't own`)
    }

    const addQuestionImagePromise = this.fileUploadService.uploadFile(
      command.questionImg.buffer,
      command.questionImg.originalname
    )
    const addAnswerImagePromise = this.fileUploadService.uploadFile(
      command.answerImg.buffer,
      command.answerImg.originalname
    )

    let questionImg, answerImg

    if (command.questionImg && command.answerImg) {
      const result = await Promise.all([addQuestionImagePromise, addAnswerImagePromise])
      questionImg = result[0].fileUrl
      answerImg = result[1].fileUrl
    } else if (command.answerImg) {
      const result = await addAnswerImagePromise
      answerImg = result.fileUrl
    } else if (command.questionImg) {
      const result = await addQuestionImagePromise
      questionImg = result.fileUrl
    }
    return await this.cardsRepository.updateCardById(command.cardId, {
      ...command.card,
      answerImg,
      questionImg,
    })
  }
}
