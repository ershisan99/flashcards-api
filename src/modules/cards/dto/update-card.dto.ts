import { PartialType } from '@nestjs/mapped-types'
import { CreateCardDto } from './create-card.dto'
import { IsOptionalOrEmptyString } from '../../../infrastructure/decorators/is-optional-or-empty-string'
import { IsBoolean } from 'class-validator'

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @IsOptionalOrEmptyString()
  name: string

  @IsOptionalOrEmptyString()
  @IsBoolean()
  isPrivate: boolean

  @IsOptionalOrEmptyString()
  cover: string
}
