import { PartialType } from '@nestjs/mapped-types'
import { CreateDeckDto } from './create-deck.dto'
import { IsOptionalOrEmptyString } from '../../../infrastructure/decorators/is-optional-or-empty-string'
import { IsBoolean } from 'class-validator'

export class UpdateDeckDto extends PartialType(CreateDeckDto) {
  @IsOptionalOrEmptyString()
  name: string

  @IsOptionalOrEmptyString()
  @IsBoolean()
  isPrivate: boolean

  @IsOptionalOrEmptyString()
  cover: string
}