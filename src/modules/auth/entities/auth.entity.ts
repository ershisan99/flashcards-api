import { ApiProperty, OmitType } from '@nestjs/swagger'

import { ApiSchema } from '../../../infrastructure/common/helpers/api-schema'

export class User {
  id: string
  email: string
  password: string
  isEmailVerified: boolean
  name: string
  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: string
  created: Date
  updated: Date
}

export class LoginResponse {
  accessToken: string
  refreshToken: string
}

@ApiSchema({ name: 'User' })
export class UserEntity extends OmitType(User, ['password']) {}
