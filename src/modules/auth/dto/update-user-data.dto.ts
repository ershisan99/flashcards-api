import { PartialType, PickType } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { User } from '../entities/auth.entity'

export class UpdateUserDataDto extends PartialType(PickType(User, ['name', 'avatar'] as const)) {
  @IsOptional()
  avatar?: string

  @IsOptional()
  name?: string
}
