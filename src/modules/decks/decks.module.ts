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
} from './use-cases'
import { DecksRepository } from './infrastructure/decks.repository'

const commandHandlers = [
  CreateDeckHandler,
  GetAllDecksHandler,
  GetDeckByIdHandler,
  DeleteDeckByIdHandler,
  UpdateDeckHandler,
]

@Module({
  imports: [CqrsModule],
  controllers: [DecksController],
  providers: [DecksService, DecksRepository, ...commandHandlers],
  exports: [CqrsModule],
})
export class DecksModule {}
