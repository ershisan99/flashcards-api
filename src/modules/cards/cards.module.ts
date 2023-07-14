import { Module } from '@nestjs/common'
import { CardsService } from './cards.service'
import { CardsController } from './cards.controller'
import { CqrsModule } from '@nestjs/cqrs'
import { DeleteCardByIdHandler, GetDeckByIdHandler, UpdateDeckHandler } from './use-cases'
import { CardsRepository } from './infrastructure/cards.repository'

const commandHandlers = [GetDeckByIdHandler, DeleteCardByIdHandler, UpdateDeckHandler]

@Module({
  imports: [CqrsModule],
  controllers: [CardsController],
  providers: [CardsService, CardsRepository, ...commandHandlers],
  exports: [CqrsModule],
})
export class CardsModule {}
