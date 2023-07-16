import { Module } from '@nestjs/common'
import { CardsService } from './cards.service'
import { CardsController } from './cards.controller'
import { CqrsModule } from '@nestjs/cqrs'
import { DeleteCardByIdHandler, GetDeckByIdHandler, UpdateCardHandler } from './use-cases'
import { CardsRepository } from './infrastructure/cards.repository'
import { FileUploadService } from '../../infrastructure/file-upload-service/file-upload.service'

const commandHandlers = [GetDeckByIdHandler, DeleteCardByIdHandler, UpdateCardHandler]

@Module({
  imports: [CqrsModule],
  controllers: [CardsController],
  providers: [CardsService, CardsRepository, FileUploadService, ...commandHandlers],
  exports: [CqrsModule],
})
export class CardsModule {}
