import { IsOptional, IsUUID, Length } from 'class-validator'
import { IsOptionalOrEmptyString } from '../../../infrastructure/decorators/is-optional-or-empty-string'
import { PaginationDto } from '../../../infrastructure/common/pagination/pagination.dto'

export class GetAllDecksDto extends PaginationDto {
  @IsOptional()
  @Length(3, 30)
  name?: string

  @IsOptionalOrEmptyString()
  @IsUUID(4)
  authorId?: string

  userId: string
}
