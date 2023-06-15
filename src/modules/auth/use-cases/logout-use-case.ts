import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Logger } from '@nestjs/common'
import { UsersRepository } from '../../users/infrastructure/users.repository'
import jwt from 'jsonwebtoken'

export class LogoutCommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  private readonly logger = new Logger(LogoutHandler.name)

  async execute(command: LogoutCommand) {
    const token = command.refreshToken

    const secretKey = process.env.JWT_SECRET_KEY
    if (!secretKey) throw new Error('JWT_SECRET_KEY is not defined')

    try {
      const decoded: any = jwt.verify(token, secretKey)
      return this.usersRepository.revokeToken(decoded.userId, token)
    } catch (e) {
      this.logger.log(`Decoding error: ${e}`)
      return null
    }
  }
}
