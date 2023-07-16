import { Length } from 'class-validator'

import { PaginationDto } from '../../../infrastructure/common/pagination/pagination.dto'
import { IsOptionalOrEmptyString, IsOrderBy } from '../../../infrastructure/decorators'

export class GetAllCardsInDeckDto extends PaginationDto {
  @IsOptionalOrEmptyString()
  @Length(1, 30)
  question?: string

  @IsOptionalOrEmptyString()
  @Length(1, 30)
  answer?: string

  @IsOrderBy()
  orderBy?: string | null
}
