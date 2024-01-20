import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator'

import { PaginationDto } from '../../../infrastructure/common/pagination/pagination.dto'
import { IsOptionalOrEmptyString, IsOrderBy } from '../../../infrastructure/decorators'

export enum DecksOrderBy {
  'null' = 'null',
  'cardsCount-asc' = 'cardsCount-asc',
  'updated-asc' = 'updated-asc',
  'name-asc' = 'name-asc',
  'author.name-asc' = 'author.name-asc',
  'created-asc' = 'created-asc',
  'cardsCount-decs' = 'cardsCount-decs',
  'updated-decs' = 'updated-decs',
  'name-decs' = 'name-decs',
  'author.name-decs' = 'author.name-decs',
  'created-decs' = 'created-decs',
}

export class GetAllDecksDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minCardsCount?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxCardsCount?: number

  /** Search by deck name */
  @IsOptionalOrEmptyString()
  name?: string

  /** Filter by deck authorId */
  @IsOptionalOrEmptyString()
  @IsUUID(4)
  authorId?: string

  @ApiHideProperty()
  userId?: string

  /** A string that represents the name of the field to order by and the order direction.
   * The format is: "field_name-order_direction".
   * Available directions: "asc" and "desc".
   * @example "name-desc"
   * */
  @IsOrderBy()
  @ApiProperty({
    enum: DecksOrderBy,
  })
  @IsEnum(DecksOrderBy)
  orderBy?: DecksOrderBy
}
