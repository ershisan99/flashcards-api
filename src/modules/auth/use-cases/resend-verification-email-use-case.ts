import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { UsersRepository } from '../../users/infrastructure/users.repository'
import { UsersService } from '../../users/services/users.service'
import { ResendVerificationEmailDto } from '../dto'

export class ResendVerificationEmailCommand {
  constructor(public readonly body: ResendVerificationEmailDto) {}
}

@CommandHandler(ResendVerificationEmailCommand)
export class ResendVerificationEmailHandler
  implements ICommandHandler<ResendVerificationEmailCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService
  ) {}

  async execute(command: ResendVerificationEmailCommand) {
    const user = await this.usersRepository.findUserById(command.body.userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email has already been verified')
    }

    const updatedUser = await this.usersRepository.updateVerificationToken(user.id)

    await this.usersService.sendConfirmationEmail({
      email: updatedUser.user.email,
      name: updatedUser.user.name,
      verificationToken: updatedUser.verificationToken,
      html: command.body.html,
      subject: command.body.subject,
    })
    if (!updatedUser) {
      throw new NotFoundException('User not found')
    }

    return null
  }
}
