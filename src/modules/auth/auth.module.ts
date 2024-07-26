import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'

import { FileUploadService } from '../../infrastructure/file-upload-service/file-upload.service'
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
  UpdateUserHandler,
} from './use-cases'
import { DeleteCurrentUserAccountHandler } from './use-cases/delete-current-user-account-use-case'

const commandHandlers = [
  CreateUserHandler,
  GetCurrentUserDataHandler,
  DeleteCurrentUserAccountHandler,
  LogoutHandler,
  RefreshTokenHandler,
  ResendVerificationEmailHandler,
  ResetPasswordHandler,
  SendPasswordRecoveryEmailHandler,
  VerifyEmailHandler,
  UpdateUserHandler,
]

@Module({
  imports: [UsersModule, CqrsModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, AuthRepository, FileUploadService, ...commandHandlers],
  exports: [AuthService, CqrsModule],
})
export class AuthModule {}
