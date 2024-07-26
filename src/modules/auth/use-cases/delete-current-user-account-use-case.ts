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
    return await this.usersRepository.deleteUserById(command.userId)
  }
}
