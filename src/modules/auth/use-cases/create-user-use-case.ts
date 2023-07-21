import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { addHours } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

import { CreateUserInput, UserViewType } from '../../../types/types'
import { UsersRepository } from '../../users/infrastructure/users.repository'
import { UsersService } from '../../users/services/users.service'
import { RegistrationDto } from '../dto'

export class CreateUserCommand {
  constructor(public readonly user: RegistrationDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService
  ) {}

  async execute(command: CreateUserCommand): Promise<UserViewType | null> {
    const { name, password, email } = command.user
    const passwordHash = await this.usersService.generateHash(password)
    const verificationToken = uuidv4()
    const newUser: CreateUserInput = {
      name: name || email.split('@')[0],
      email: email,
      password: passwordHash,
      verificationToken,
      verificationTokenExpiry: addHours(new Date(), 24),
      isEmailVerified: false,
    }
    const createdUser = await this.usersRepository.createUser(newUser)

    if (!createdUser) {
      return null
    }
    if (!command.user.sendConfirmationEmail) {
      return {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
      }
    }
    await this.usersService.sendConfirmationEmail({
      email: createdUser.email,
      name: createdUser.name,
      verificationToken: verificationToken,
      html: command.user.html,
      subject: command.user.subject,
    })

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    }
  }
}
