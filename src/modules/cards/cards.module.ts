import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'

import { FileUploadService } from '../../infrastructure/file-upload-service/file-upload.service'

import { CardsController } from './cards.controller'
import { CardsService } from './cards.service'
import { CardsRepository } from './infrastructure/cards.repository'
import { DeleteCardByIdHandler, GetDeckByIdHandler, UpdateCardHandler } from './use-cases'

const commandHandlers = [GetDeckByIdHandler, DeleteCardByIdHandler, UpdateCardHandler]

@Module({
  imports: [CqrsModule],
  controllers: [CardsController],
  providers: [CardsService, CardsRepository, FileUploadService, ...commandHandlers],
  exports: [CqrsModule],
})
export class CardsModule {}
