import { NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { v4 as uuidv4 } from 'uuid'

import { UsersRepository } from '../../users/infrastructure/users.repository'
import { UsersService } from '../../users/services/users.service'
import { RecoverPasswordDto } from '../dto'

export class SendPasswordRecoveryEmailCommand {
  constructor(public readonly body: RecoverPasswordDto) {}
}

@CommandHandler(SendPasswordRecoveryEmailCommand)
export class SendPasswordRecoveryEmailHandler
  implements ICommandHandler<SendPasswordRecoveryEmailCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService
  ) {}

  async execute(command: SendPasswordRecoveryEmailCommand) {
    const user = await this.usersRepository.findUserByEmail(command.body.email)

    if (!user) {
      throw new NotFoundException('User not found')
    }
    const token = uuidv4()
    const updatedUser = await this.usersRepository.createPasswordResetToken(user.id, token)

    await this.usersService.sendPasswordRecoveryEmail({
      email: updatedUser.user.email,
      name: updatedUser.user.name,
      html: command.body.html,
      passwordRecoveryToken: updatedUser.resetPasswordToken,
      subject: command.body.subject,
    })
    if (!updatedUser) {
      throw new NotFoundException('User not found')
    }

    return null
  }
}
