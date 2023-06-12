import { BadRequestException, CanActivate, ExecutionContext } from '@nestjs/common'
import { UsersRepository } from '../../modules/users/infrastructure/users.repository'

export class LimitsControlGuard implements CanActivate {
  constructor(private usersRepository: UsersRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> | null {
    const request = context.switchToHttp().getRequest()
    const email = request.body.email
    const userWithExistingEmail = await this.usersRepository.findUserByEmail(email)
    if (userWithExistingEmail)
      throw new BadRequestException({
        message: 'email already exist',
        field: 'email',
      })
    return true
  }
}
