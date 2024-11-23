import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { UsersRepository } from '../../users/infrastructure/users.repository'

export class DeleteCurrentAccountCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(DeleteCurrentAccountCommand)
export class DeleteCurrentUserAccountHandler
  implements ICommandHandler<DeleteCurrentAccountCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: DeleteCurrentAccountCommand): Promise<boolean> {
    if (command.userId === '16163541-acf6-4ad4-ab16-1546309979a5') {
      throw new BadRequestException('Test account cannot be deleted')
    }

    return await this.usersRepository.deleteUserById(command.userId)
  }
}
