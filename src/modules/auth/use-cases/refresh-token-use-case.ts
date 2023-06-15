import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthRepository } from '../infrastructure/auth.repository'
import jwt from 'jsonwebtoken'
import { addDays } from 'date-fns'

export class RefreshTokenCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(command: RefreshTokenCommand) {
    const { userId } = command

    const accessSecretKey = process.env.ACCESS_JWT_SECRET_KEY
    const refreshSecretKey = process.env.REFRESH_JWT_SECRET_KEY

    const payload: { userId: string; date: Date } = {
      userId,
      date: new Date(),
    }
    const accessToken = jwt.sign(payload, accessSecretKey, { expiresIn: '10m' })
    const refreshToken = jwt.sign(payload, refreshSecretKey, {
      expiresIn: '30d',
    })
    const expiresIn = addDays(new Date(), 30)
    await this.authRepository.createRefreshToken(userId, refreshToken, expiresIn)
    return {
      accessToken,
      refreshToken,
    }
  }
}
