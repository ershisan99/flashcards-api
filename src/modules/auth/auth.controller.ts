import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Request,
  Res,
  Response,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'

import { Cookies } from '../../infrastructure/decorators'

import {
  EmailVerificationDto,
  LoginDto,
  RecoverPasswordDto,
  RegistrationDto,
  ResendVerificationEmailDto,
} from './dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { UpdateUserDataDto } from './dto/update-user-data.dto'
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
  UpdateUserCommand,
  VerifyEmailCommand,
} from './use-cases'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  @ApiOperation({ description: 'Retrieve current user data.', summary: 'Current user data' })
  @ApiUnauthorizedResponse({ description: 'Not logged in' })
  @ApiBadRequestResponse({ description: 'User not found' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async getUserData(@Request() req): Promise<UserEntity> {
    const userId = req.user.id

    return await this.commandBus.execute(new GetCurrentUserDataCommand(userId))
  }

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ description: 'Update current user data.', summary: 'Update user data' })
  @ApiUnauthorizedResponse({ description: 'Not logged in' })
  @ApiBadRequestResponse({ description: 'User not found' })
  @ApiBearerAuth()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]))
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateUserData(
    @Request() req,
    @UploadedFiles()
    files: { avatar: Express.Multer.File[] },
    @Body() body: UpdateUserDataDto
  ): Promise<UserEntity> {
    const userId = req.user.id

    return await this.commandBus.execute(new UpdateUserCommand(userId, body, files?.avatar?.[0]))
  }

  @ApiOperation({
    description: 'Sign in using email and password. Must have an account to do so.',
    summary: 'Sign in using email and password. Must have an account to do so.',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
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

    return { accessToken: req.user.data.accessToken, refreshToken: req.user.data.refreshToken }
  }

  @ApiOperation({ description: 'Create a new user account', summary: 'Create a new user account' })
  @ApiBadRequestResponse({ description: 'Email already exists' })
  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  async registration(@Body() registrationData: RegistrationDto): Promise<UserEntity> {
    return await this.commandBus.execute(new CreateUserCommand(registrationData))
  }

  @ApiOperation({ description: 'Verify user email', summary: 'Verify user email' })
  @ApiBadRequestResponse({ description: 'Email has already been verified' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNoContentResponse({ description: 'Email verified successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('verify-email')
  async confirmRegistration(@Body() body: EmailVerificationDto): Promise<void> {
    return await this.commandBus.execute(new VerifyEmailCommand(body.code))
  }

  @ApiOperation({
    description: 'Send verification email again',
    summary: 'Send verification email again',
  })
  @ApiBadRequestResponse({ description: 'Email has already been verified' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNoContentResponse({ description: 'Verification email sent successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() body: ResendVerificationEmailDto): Promise<void> {
    return await this.commandBus.execute(new ResendVerificationEmailCommand(body))
  }

  @ApiOperation({ description: 'Sign current user out', summary: 'Sign current user out' })
  @ApiUnauthorizedResponse({ description: 'Not logged in' })
  @ApiNoContentResponse({ description: 'Logged out successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  async logout(
    @Cookies('accessToken') accessToken: string,
    @Res({ passthrough: true }) res: ExpressResponse
  ): Promise<void> {
    if (!accessToken) throw new UnauthorizedException()

    await this.commandBus.execute(new LogoutCommand(accessToken))

    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'none', secure: true })

    res.clearCookie('refreshToken', {
      path: '/v1/auth/refresh-token',
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })

    return null
  }

  @Version('2')
  @ApiOperation({ description: 'Sign current user out', summary: 'Sign current user out' })
  @ApiUnauthorizedResponse({ description: 'Not logged in' })
  @ApiNoContentResponse({ description: 'Logged out successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  async logout2(
    @Cookies('accessToken') accessToken: string,
    @Req() req: ExpressRequest
  ): Promise<void> {
    const authorization = req.headers.authorization

    const token = authorization?.split(' ')[1]

    if (!token) throw new UnauthorizedException()

    await this.commandBus.execute(new LogoutCommand(token))

    return null
  }

  @ApiOperation({
    description: 'Deprecated, use v2',
    summary: 'Deprecated, use v2',
    deprecated: true,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing refreshToken' })
  @ApiNoContentResponse({ description: 'New tokens generated successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  async refreshToken(
    @Request() req,
    @Response({ passthrough: true }) res: ExpressResponse
  ): Promise<LoginResponse> {
    if (!req.cookies?.refreshToken) throw new UnauthorizedException()
    const userId = req.user.id
    const shortAccessToken = req.headers['x-short-access-token'] === 'true'
    const newTokens = await this.commandBus.execute(
      new RefreshTokenCommand(userId, shortAccessToken)
    )

    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      path: '/v1/auth/refresh-token',
      secure: true,
    })
    res.cookie('accessToken', newTokens.accessToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })
    res.send({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    })

    return null
  }

  @ApiOperation({
    description: 'Get new access token using refresh token',
    summary: 'Get new access token using refresh token',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing refreshToken' })
  @ApiOkResponse({ description: 'New tokens generated successfully' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  @Version('2')
  async refreshTokenV2(@Request() req): Promise<LoginResponse> {
    const userId = req.user.id
    const shortAccessToken = req.headers['x-short-access-token'] === 'true'
    const newTokens = await this.commandBus.execute(
      new RefreshTokenCommand(userId, shortAccessToken)
    )

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    }
  }

  @ApiOperation({
    description: 'Send password recovery email',
    summary: 'Send password recovery email',
  })
  @ApiBadRequestResponse({ description: 'Email has already been verified' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNoContentResponse({ description: 'Password recovery email sent successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('recover-password')
  async recoverPassword(@Body() body: RecoverPasswordDto): Promise<void> {
    return await this.commandBus.execute(new SendPasswordRecoveryEmailCommand(body))
  }

  @ApiOperation({ description: 'Reset password', summary: 'Reset password' })
  @ApiBadRequestResponse({ description: 'Password is required' })
  @ApiNotFoundResponse({ description: 'Incorrect or expired password reset token' })
  @ApiNoContentResponse({ description: 'Password reset successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('reset-password/:token')
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Param('token') token: string
  ): Promise<void> {
    return await this.commandBus.execute(new ResetPasswordCommand(token, body.password))
  }
}
