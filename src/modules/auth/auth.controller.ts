import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  Res,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { Response as ExpressResponse } from 'express'

import { Cookies } from '../../infrastructure/decorators'

import {
  EmailVerificationDto,
  LoginDto,
  RecoverPasswordDto,
  RegistrationDto,
  ResendVerificationEmailDto,
} from './dto'
import { LoginResponse, UserEntity } from './entities/auth.entity'
import { JwtAuthGuard, JwtRefreshGuard, LocalAuthGuard } from './guards'
import {
  CreateUserCommand,
  GetCurrentUserDataCommand,
  LogoutCommand,
  RefreshTokenCommand,
  ResendVerificationEmailCommand,
  ResetPasswordCommand,
  SendPasswordRecoveryEmailCommand,
  VerifyEmailCommand,
} from './use-cases'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUserData(@Request() req): Promise<UserEntity> {
    const userId = req.user.id

    return await this.commandBus.execute(new GetCurrentUserDataCommand(userId))
  }

  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req,
    @Res({ passthrough: true }) res: ExpressResponse
  ): Promise<LoginResponse> {
    const userData = req.user.data

    res.cookie('refreshToken', userData.refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      path: '/v1/auth/refresh-token',
      secure: true,
    })
    res.cookie('accessToken', userData.accessToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })

    return { accessToken: req.user.data.accessToken }
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  async registration(@Body() registrationData: RegistrationDto): Promise<UserEntity> {
    return await this.commandBus.execute(new CreateUserCommand(registrationData))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('verify-email')
  async confirmRegistration(@Body() body: EmailVerificationDto): Promise<void> {
    return await this.commandBus.execute(new VerifyEmailCommand(body.code))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() body: ResendVerificationEmailDto): Promise<void> {
    return await this.commandBus.execute(new ResendVerificationEmailCommand(body.userId))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: ExpressResponse
  ): Promise<void> {
    if (!refreshToken) throw new UnauthorizedException()
    await this.commandBus.execute(new LogoutCommand(refreshToken))
    res.clearCookie('refreshToken')

    return null
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  async refreshToken(
    @Request() req,
    @Response({ passthrough: true }) res: ExpressResponse
  ): Promise<LoginResponse> {
    if (!req.cookies?.refreshToken) throw new UnauthorizedException()
    const userId = req.user.id
    const newTokens = await this.commandBus.execute(new RefreshTokenCommand(userId))

    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      // secure: true,
      path: '/v1/auth/refresh-token',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })

    return {
      accessToken: newTokens.accessToken,
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('recover-password')
  async recoverPassword(@Body() body: RecoverPasswordDto): Promise<void> {
    return await this.commandBus.execute(new SendPasswordRecoveryEmailCommand(body.email))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('reset-password/:token')
  async resetPassword(
    @Body('password') password: string,
    @Param('token') token: string
  ): Promise<void> {
    return await this.commandBus.execute(new ResetPasswordCommand(token, password))
  }
}
