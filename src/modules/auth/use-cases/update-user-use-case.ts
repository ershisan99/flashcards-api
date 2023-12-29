import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { pick } from 'remeda'

import { FileUploadService } from '../../../infrastructure/file-upload-service/file-upload.service'
import { UsersRepository } from '../../users/infrastructure/users.repository'
import { UpdateUserDataDto } from '../dto/update-user-data.dto'
import { UserEntity } from '../entities/auth.entity'

export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly user: UpdateUserDataDto,
    public readonly avatar: Express.Multer.File
  ) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly fileUploadService: FileUploadService
  ) {}

  async execute(command: UpdateUserCommand): Promise<UserEntity | null> {
    let avatar: string | null

    if (command.avatar) {
      const addAvatarImagePromise = this.fileUploadService.uploadFile(
        command.avatar?.buffer,
        command.avatar?.originalname
      )

      const result = await addAvatarImagePromise

      avatar = result.fileUrl
    } else if (command.user.avatar === '') {
      avatar = null
    }

    const updatedUser = await this.usersRepository.updateUser(command.userId, {
      name: command.user.name?.trim(),
      avatar,
    })

    if (!updatedUser) {
      return null
    }

    return pick(updatedUser, [
      'id',
      'name',
      'email',
      'isEmailVerified',
      'avatar',
      'created',
      'updated',
    ])
  }
}
