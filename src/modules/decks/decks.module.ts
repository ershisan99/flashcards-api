import { Module } from '@nestjs/common'
import { DecksService } from './decks.service'
import { DecksController } from './decks.controller'
import { CqrsModule } from '@nestjs/cqrs'
import {
  CreateDeckHandler,
  DeleteDeckByIdHandler,
  GetDeckByIdHandler,
  GetAllDecksHandler,
  UpdateDeckHandler,
  GetAllCardsInDeckHandler,
  CreateCardHandler,
} from './use-cases'
import { DecksRepository } from './infrastructure/decks.repository'
import { CardsRepository } from '../cards/infrastructure/cards.repository'
import { GetRandomCardInDeckHandler } from './use-cases/get-random-card-in-deck-use-case'
import { GradesRepository } from './infrastructure/grades.repository'
import { SaveGradeHandler } from './use-cases/save-grade-use-case'
import { FileUploadService } from '../../infrastructure/file-upload-service/file-upload.service'

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
