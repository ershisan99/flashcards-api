import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { User } from '../entities/auth.entity'

export class UpdateUserDataDto extends PickType(User, ['name', 'avatar'] as const) {
  @IsOptional()
  @ApiProperty({ required: false })
  avatar: string

  @IsOptional()
  @ApiProperty({ required: false })
  name: string
}
