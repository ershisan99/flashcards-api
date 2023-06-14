import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Response,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegistrationDto } from './dto/registration.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { UsersService } from '../users/services/users.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { Response as ExpressResponse } from 'express'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { Cookies } from '../../infrastructure/decorators/cookie.decorator'
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUserData(@Request() req) {
    const userId = req.user.id
    const user = await this.usersService.getUserById(userId)

    if (!user) throw new UnauthorizedException()

    return {
      email: user.email,
      name: user.name,
      id: user.id,
    }
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
    return await this.usersService.createUser(
      registrationData.name,
      registrationData.password,
      registrationData.email
    )
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async confirmRegistration(@Body('code') confirmationCode) {
    const result = await this.authService.confirmEmail(confirmationCode)
    if (!result) {
      throw new NotFoundException()
    }
    return null
  }

  @Post('resend-verification-email')
  async resendRegistrationEmail(@Body('userId') userId: string) {
    const isResent = await this.authService.resendCode(userId)
    if (!isResent)
      throw new BadRequestException({
        message: 'Email already confirmed or such email was not found',
        field: 'email',
      })
    return null
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: ExpressResponse
  ) {
    if (!refreshToken) throw new UnauthorizedException()
    await this.usersService.addRevokedToken(refreshToken)
    res.clearCookie('refreshToken')
    return null
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Get('refresh-token')
  async refreshToken(@Request() req, @Response({ passthrough: true }) res: ExpressResponse) {
    if (!req.cookies?.refreshToken) throw new UnauthorizedException()
    const userId = req.user.id
    const newTokens = await this.authService.createJwtTokensPair(userId)
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
}
