import { UnauthorizedException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { pick } from 'remeda'

import { UserViewType } from '../../../types/types'
import { UsersRepository } from '../../users/infrastructure/users.repository'

export class GetCurrentUserDataCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(GetCurrentUserDataCommand)
export class GetCurrentUserDataHandler implements ICommandHandler<GetCurrentUserDataCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetCurrentUserDataCommand): Promise<UserViewType | null> {
    const user = await this.usersRepository.findUserById(command.userId)

    if (!user) throw new UnauthorizedException()

    return pick(user, ['email', 'name', 'id', 'isEmailVerified', 'avatar', 'created', 'updated'])
  }
}
