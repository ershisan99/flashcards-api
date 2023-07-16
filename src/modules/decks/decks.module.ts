import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'

import { FileUploadService } from '../../infrastructure/file-upload-service/file-upload.service'
import { CardsRepository } from '../cards/infrastructure/cards.repository'

import { DecksController } from './decks.controller'
import { DecksService } from './decks.service'
import { DecksRepository } from './infrastructure/decks.repository'
import { GradesRepository } from './infrastructure/grades.repository'
import {
  CreateDeckHandler,
  DeleteDeckByIdHandler,
  GetDeckByIdHandler,
  GetAllDecksHandler,
  UpdateDeckHandler,
  GetAllCardsInDeckHandler,
  CreateCardHandler,
  SaveGradeHandler,
  GetRandomCardInDeckHandler,
} from './use-cases'

const commandHandlers = [
  CreateDeckHandler,
  GetAllDecksHandler,
  GetDeckByIdHandler,
  GetRandomCardInDeckHandler,
  DeleteDeckByIdHandler,
  UpdateDeckHandler,
  GetAllCardsInDeckHandler,
  CreateCardHandler,
  SaveGradeHandler,
]

@Module({
  imports: [CqrsModule],
  controllers: [DecksController],
  providers: [
    DecksService,
    DecksRepository,
    CardsRepository,
    GradesRepository,
    FileUploadService,
    ...commandHandlers,
  ],
  exports: [CqrsModule],
})
export class DecksModule {}
