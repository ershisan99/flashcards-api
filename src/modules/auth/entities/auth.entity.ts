import { ApiProperty, OmitType } from '@nestjs/swagger'

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
}

export class UserEntity extends OmitType(User, ['password']) {}
