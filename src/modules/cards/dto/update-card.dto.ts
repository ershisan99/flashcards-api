import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, Length } from 'class-validator'

import { ApiSchema } from '../../../infrastructure/common/helpers/api-schema'

import { CreateCardDto } from './create-card.dto'

@ApiSchema({ name: 'UpdateCardRequest' })
export class UpdateCardDto extends PartialType(CreateCardDto) {
  @IsOptional()
  @Length(3, 500)
  question?: string

  @IsOptional()
  @Length(3, 500)
  answer?: string

  @IsOptional()
  @Length(0, 0)
  @ApiProperty({ type: 'string', format: 'binary' })
  questionImg?: string

  @IsOptional()
  @Length(0, 0)
  @ApiProperty({ type: 'string', format: 'binary' })
  answerImg?: string

  @IsOptional()
  @Length(3, 500)
  questionVideo?: string

  @IsOptional()
  @Length(3, 500)
  answerVideo?: string
}
