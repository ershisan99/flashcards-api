import { IsUUID } from 'class-validator'
import { IsOptionalOrEmptyString } from '../../../infrastructure/decorators/is-optional-or-empty-string'
import { PaginationDto } from '../../../infrastructure/common/pagination/pagination.dto'

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
}
