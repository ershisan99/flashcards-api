import { PickType } from '@nestjs/swagger'
import { IsEmail, IsOptional } from 'class-validator'

import { User } from '../entities/auth.entity'

export class UpdateUserDataDto extends PickType(User, ['name', 'email', 'avatar'] as const) {
  avatar: string

  @IsOptional()
  name: string

  @IsOptional()
  @IsEmail()
  email: string
}
