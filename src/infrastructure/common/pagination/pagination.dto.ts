import { IsNumber, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentPage?: number

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  itemsPerPage?: number
}
