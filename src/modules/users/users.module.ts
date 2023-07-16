import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'

import { UsersController } from './api/users.controller'
import { UsersRepository } from './infrastructure/users.repository'
import { UsersService } from './services/users.service'

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersRepository, UsersService, CqrsModule],
})
export class UsersModule {}
