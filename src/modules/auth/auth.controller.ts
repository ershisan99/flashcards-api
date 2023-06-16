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
import { RegistrationDto } from './dto/registration.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { Response as ExpressResponse } from 'express'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { Cookies } from '../../infrastructure/decorators/cookie.decorator'
import { CommandBus } from '@nestjs/cqrs'
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

@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUserData(@Request() req) {
    const userId = req.user.id
    return await this.commandBus.execute(new GetCurrentUserDataCommand(userId))
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: ExpressResponse) {
    const userData = req.user.data
    res.cookie('refreshToken', userData.refreshToken, {
      httpOnly: true,
      // secure: true,
      path: '/v1/auth/refresh-token',
    })
    return { accessToken: req.user.data.accessToken }
  }

  @HttpCode(201)
  @Post('sign-up')
  async registration(@Body() registrationData: RegistrationDto) {
    return await this.commandBus.execute(new CreateUserCommand(registrationData))
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async confirmRegistration(@Body('code') confirmationCode) {
    return await this.commandBus.execute(new VerifyEmailCommand(confirmationCode))
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body('userId') userId: string) {
    return await this.commandBus.execute(new ResendVerificationEmailCommand(userId))
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: ExpressResponse
  ) {
    if (!refreshToken) throw new UnauthorizedException()
    await this.commandBus.execute(new LogoutCommand(refreshToken))
    res.clearCookie('refreshToken')
    return null
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Get('refresh-token')
  async refreshToken(@Request() req, @Response({ passthrough: true }) res: ExpressResponse) {
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

  @Post('recover-password')
  async recoverPassword(@Body('email') email: string) {
    return await this.commandBus.execute(new SendPasswordRecoveryEmailCommand(email))
  }

  @Post('reset-password/:token')
  async resetPassword(@Body('password') password: string, @Param('token') token: string) {
    return await this.commandBus.execute(new ResetPasswordCommand(token, password))
  }
}
