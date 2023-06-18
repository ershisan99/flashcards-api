import { Length } from 'class-validator'
import { PaginationDto } from '../../../infrastructure/common/pagination/pagination.dto'
import { IsOptionalOrEmptyString } from '../../../infrastructure/decorators/is-optional-or-empty-string'

export class GetAllCardsInDeckDto extends PaginationDto {
  @IsOptionalOrEmptyString()
  @Length(1, 30)
  question?: string

  @IsOptionalOrEmptyString()
  @Length(1, 30)
  answer?: string
}
