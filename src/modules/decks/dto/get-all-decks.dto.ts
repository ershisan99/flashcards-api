import { IsUUID } from 'class-validator'

import { PaginationDto } from '../../../infrastructure/common/pagination/pagination.dto'
import { IsOptionalOrEmptyString, IsOrderBy } from '../../../infrastructure/decorators'

export class GetAllDecksDto extends PaginationDto {
  @IsOptionalOrEmptyString()
  minCardsCount?: string

  @IsOptionalOrEmptyString()
  maxCardsCount?: string

  @IsOptionalOrEmptyString()
  name?: string

  @IsOptionalOrEmptyString()
  @IsUUID(4)
  authorId?: string

  userId: string

  @IsOrderBy()
  orderBy?: string | null
}
