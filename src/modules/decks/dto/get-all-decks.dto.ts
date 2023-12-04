import { ApiHideProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsUUID } from 'class-validator'

import { PaginationDto } from '../../../infrastructure/common/pagination/pagination.dto'
import { IsOptionalOrEmptyString, IsOrderBy } from '../../../infrastructure/decorators'

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
  orderBy?: string | null
}
