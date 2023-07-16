import { OmitType } from '@nestjs/swagger'

export class User {
  id: string
  email: string
  password: string
  isEmailVerified: boolean
  name: string
  avatar: string
  created: string
  updated: string
}

export class LoginResponse {
  accessToken: string
}

export class UserEntity extends OmitType(User, ['password']) {}
