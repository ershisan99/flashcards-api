import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional } from 'class-validator'

import { PaginationDto } from '../../../infrastructure/common/pagination/pagination.dto'
import { IsOptionalOrEmptyString, IsOrderBy } from '../../../infrastructure/decorators'
import { IsUUIDOrCaller } from '../../../infrastructure/decorators/is-uuid-or-caller'

export enum DecksOrderBy {
  'null' = 'null',
  'cardsCount-asc' = 'cardsCount-asc',
  'updated-asc' = 'updated-asc',
  'name-asc' = 'name-asc',
  'author.name-asc' = 'author.name-asc',
  'created-asc' = 'created-asc',
  'cardsCount-desc' = 'cardsCount-desc',
  'updated-desc' = 'updated-desc',
  'name-desc' = 'name-desc',
  'author.name-desc' = 'author.name-desc',
  'created-desc' = 'created-desc',
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

  /** Filter by deck authorId
   * If ~caller is passed, it will be replaced with the current user's id
   */
  @IsOptionalOrEmptyString()
  @IsUUIDOrCaller()
  authorId?: string

  /** Decks favorited by user
   * If ~caller is passed, it will be replaced with the current user's id
   * */
  @IsOptionalOrEmptyString()
  @IsUUIDOrCaller()
  favoritedBy?: string

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
    required: false,
  })
  @IsOptional()
  @IsEnum(DecksOrderBy, {})
  orderBy?: DecksOrderBy
}
