import { Module } from '@nestjs/common'
import { CardsService } from './cards.service'
import { CardsController } from './cards.controller'
import { CqrsModule } from '@nestjs/cqrs'
import { DeleteCardByIdHandler, GetDeckByIdHandler, UpdateCardHandler } from './use-cases'
import { CardsRepository } from './infrastructure/cards.repository'

const commandHandlers = [GetDeckByIdHandler, DeleteCardByIdHandler, UpdateCardHandler]

@Module({
  imports: [CqrsModule],
  controllers: [CardsController],
  providers: [CardsService, CardsRepository, ...commandHandlers],
  exports: [CqrsModule],
})
export class CardsModule {}
