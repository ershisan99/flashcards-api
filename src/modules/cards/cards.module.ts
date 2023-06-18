import { Module } from '@nestjs/common'
import { CardsService } from './cards.service'
import { CardsController } from './cards.controller'
import { CqrsModule } from '@nestjs/cqrs'
import { DeleteDeckByIdHandler, GetDeckByIdHandler, UpdateDeckHandler } from './use-cases'
import { CardsRepository } from './infrastructure/cards.repository'

const commandHandlers = [GetDeckByIdHandler, DeleteDeckByIdHandler, UpdateDeckHandler]

@Module({
  imports: [CqrsModule],
  controllers: [CardsController],
  providers: [CardsService, CardsRepository, ...commandHandlers],
  exports: [CqrsModule],
})
export class CardsModule {}
