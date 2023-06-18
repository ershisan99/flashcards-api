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
} from './use-cases'
import { DecksRepository } from './infrastructure/decks.repository'
import { CardsRepository } from '../cards/infrastructure/cards.repository'
import { CreateCardHandler } from './use-cases/create-card-use-case'

const commandHandlers = [
  CreateDeckHandler,
  GetAllDecksHandler,
  GetDeckByIdHandler,
  DeleteDeckByIdHandler,
  UpdateDeckHandler,
  GetAllCardsInDeckHandler,
  CreateCardHandler,
]

@Module({
  imports: [CqrsModule],
  controllers: [DecksController],
  providers: [DecksService, DecksRepository, CardsRepository, ...commandHandlers],
  exports: [CqrsModule],
})
export class DecksModule {}
