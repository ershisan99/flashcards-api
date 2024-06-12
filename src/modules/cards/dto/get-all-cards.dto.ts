import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, Length } from 'class-validator'

import { PaginationDto } from '../../../infrastructure/common/pagination/pagination.dto'
import { IsOptionalOrEmptyString, IsOrderBy } from '../../../infrastructure/decorators'

export enum CardsOrderBy {
  'null' = 'null',
  'question-asc' = 'question-asc',
  'question-desc' = 'question-desc',
  'answer-asc' = 'answer-asc',
  'answer-desc' = 'answer-desc',
  'created-asc' = 'created-asc',
  'created-desc' = 'created-desc',
  'grade-asc' = 'grade-asc',
  'grade-desc' = 'grade-desc',
  'updated-asc' = 'updated-asc',
  'updated-desc' = 'updated-desc',
}

export class GetAllCardsInDeckDto extends PaginationDto {
  @IsOptionalOrEmptyString()
  @Length(1, 30)
  question?: string

  @IsOptionalOrEmptyString()
  @Length(1, 30)
  answer?: string

  /** A string that represents the name of the field to order by and the order direction.
   * The format is: "field_name-order_direction".
   * Available directions: "asc" and "desc".
   * @example "grade-desc"
   * */
  @IsOrderBy()
  @ApiProperty({
    enum: CardsOrderBy,
    required: false,
  })
  @IsOptional()
  @IsEnum(CardsOrderBy, {})
  orderBy?: CardsOrderBy
}
