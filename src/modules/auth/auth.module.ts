import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { LocalStrategy } from './strategies/local.strategy'
import { CqrsModule } from '@nestjs/cqrs'
import {
  CreateUserHandler,
  GetCurrentUserDataHandler,
  LogoutHandler,
  RefreshTokenHandler,
  ResendVerificationEmailHandler,
  VerifyEmailHandler,
} from './use-cases'
import { AuthRepository } from './infrastructure/auth.repository'

const commandHandlers = [
  CreateUserHandler,
  GetCurrentUserDataHandler,
  LogoutHandler,
  RefreshTokenHandler,
  ResendVerificationEmailHandler,
  VerifyEmailHandler,
]

@Module({
  imports: [UsersModule, CqrsModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, AuthRepository, ...commandHandlers],
  exports: [AuthService, CqrsModule],
})
export class AuthModule {}
