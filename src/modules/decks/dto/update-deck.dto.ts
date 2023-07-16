import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

import { IsOptionalOrEmptyString } from '../../../infrastructure/decorators'

import { CreateDeckDto } from './create-deck.dto'

export class UpdateDeckDto extends PartialType(CreateDeckDto) {
  @IsOptionalOrEmptyString()
  name?: string

  @IsOptionalOrEmptyString()
  @IsBoolean()
  isPrivate?: boolean

  @IsOptionalOrEmptyString()
  @ApiProperty({ type: 'string', format: 'binary' })
  cover?: string
}
