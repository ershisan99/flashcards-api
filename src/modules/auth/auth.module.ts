import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'

import { UsersModule } from '../users/users.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthRepository } from './infrastructure/auth.repository'
import { LocalStrategy } from './strategies/local.strategy'
import {
  CreateUserHandler,
  GetCurrentUserDataHandler,
  LogoutHandler,
  RefreshTokenHandler,
  ResendVerificationEmailHandler,
  ResetPasswordHandler,
  SendPasswordRecoveryEmailHandler,
  VerifyEmailHandler,
} from './use-cases'

const commandHandlers = [
  CreateUserHandler,
  GetCurrentUserDataHandler,
  LogoutHandler,
  RefreshTokenHandler,
  ResendVerificationEmailHandler,
  ResetPasswordHandler,
  SendPasswordRecoveryEmailHandler,
  VerifyEmailHandler,
]

@Module({
  imports: [UsersModule, CqrsModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, AuthRepository, ...commandHandlers],
  exports: [AuthService, CqrsModule],
})
export class AuthModule {}
