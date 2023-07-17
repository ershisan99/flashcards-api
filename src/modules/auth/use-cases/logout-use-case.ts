import { Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import jwt from 'jsonwebtoken'

import { UsersRepository } from '../../users/infrastructure/users.repository'

export class LogoutCommand {
  constructor(public readonly accessToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  private readonly logger = new Logger(LogoutHandler.name)

  async execute(command: LogoutCommand) {
    const token = command.accessToken

    const secretKey = process.env.ACCESS_JWT_SECRET_KEY

    if (!secretKey) throw new Error('JWT_SECRET_KEY is not defined')

    try {
      const decoded: any = jwt.verify(token, secretKey)

      await this.usersRepository.revokeToken(decoded.userId, token)

      return null
    } catch (e) {
      this.logger.error(`Decoding error: ${e}`)

      return null
    }
  }
}
