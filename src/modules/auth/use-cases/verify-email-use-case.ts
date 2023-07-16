import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { isBefore } from 'date-fns'

import { UsersRepository } from '../../users/infrastructure/users.repository'

export class VerifyEmailCommand {
  constructor(public readonly token: string) {}
}

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: VerifyEmailCommand) {
    const token = command.token

    const verificationWithUser = await this.usersRepository.findUserByVerificationToken(token)

    if (!verificationWithUser) throw new NotFoundException('User not found')

    if (verificationWithUser.isEmailVerified)
      throw new BadRequestException('Email has already been verified')

    const dbToken = verificationWithUser.verificationToken
    const isTokenExpired = isBefore(verificationWithUser.verificationTokenExpiry, new Date())

    if (dbToken !== token || isTokenExpired) {
      return false
    }

    const result = await this.usersRepository.updateEmailVerification(verificationWithUser.userId)

    if (!result) {
      throw new NotFoundException('User not found')
    }

    return null
  }
}
