import { Module } from '@nestjs/common'
import { UsersService } from './services/users.service'
import { UsersController } from './api/users.controller'
import { UsersRepository } from './infrastructure/users.repository'
import { CqrsModule } from '@nestjs/cqrs'

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersRepository, UsersService, CqrsModule],
})
export class UsersModule {}
