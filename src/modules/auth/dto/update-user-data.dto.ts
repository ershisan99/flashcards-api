import { PartialType, PickType } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { ApiSchema } from '../../../infrastructure/common/helpers/api-schema'
import { User } from '../entities/auth.entity'

@ApiSchema({ name: 'UpdateUserRequest' })
export class UpdateUserDataDto extends PartialType(PickType(User, ['name', 'avatar'] as const)) {
  @IsOptional()
  avatar?: string

  @IsOptional()
  name?: string
}
