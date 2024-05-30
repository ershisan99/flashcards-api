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
  GetAllDecksV1Handler,
  GetMinMaxCardsUseCaseHandler,
  GetAllDecksV2Handler,
  UpdateDeckHandler,
  GetAllCardsInDeckHandler,
  CreateCardHandler,
  AddDeckToFavoritesHandler,
  SaveGradeHandler,
  GetRandomCardInDeckHandler,
  RemoveDeckFromFavoritesHandler,
} from './use-cases'

const commandHandlers = [
  CreateDeckHandler,
  GetAllDecksV1Handler,
  GetAllDecksV2Handler,
  GetDeckByIdHandler,
  GetRandomCardInDeckHandler,
  DeleteDeckByIdHandler,
  GetMinMaxCardsUseCaseHandler,
  UpdateDeckHandler,
  GetAllCardsInDeckHandler,
  CreateCardHandler,
  SaveGradeHandler,
  AddDeckToFavoritesHandler,
  RemoveDeckFromFavoritesHandler,
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
