import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { UsersRepository } from '../../users/infrastructure/users.repository'
import { UsersService } from '../../users/services/users.service'

export class ResetPasswordCommand {
  constructor(public readonly resetPasswordToken: string, public readonly newPassword: string) {}
}

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService
  ) {}

  async execute(command: ResetPasswordCommand) {
    const user = await this.usersRepository.findUserByPasswordResetToken(command.resetPasswordToken)

    if (!user) {
      throw new NotFoundException('Incorrect or expired password reset token')
    }
    if (!command.newPassword) {
      throw new BadRequestException('Password is required')
    }

    const newPasswordHash = await this.usersService.generateHash(command.newPassword)

    const updatedUser = await this.usersRepository.resetPasswordAndDeleteToken(
      user.id,
      newPasswordHash
    )

    if (!updatedUser) {
      throw new NotFoundException('Incorrect or expired password reset token')
    }

    return null
  }
}
