import { Module } from '@nestjs/common'
import { DecksService } from './decks.service'
import { DecksController } from './decks.controller'
import { CqrsModule } from '@nestjs/cqrs'
import { CreateDeckHandler } from './use-cases'
import { DecksRepository } from './infrastructure/decks.repository'
import { GetAllDecksHandler } from './use-cases/get-all-decks-use-case'
import { GetDeckByIdHandler } from './use-cases/get-deck-by-id-use-case'
import { DeleteDeckByIdHandler } from './use-cases/delete-deck-by-id-use-case'
import { UpdateDeckHandler } from './use-cases/update-deck-use-case'

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
