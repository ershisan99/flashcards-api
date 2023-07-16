import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, Length } from 'class-validator'

export class CreateDeckDto {
  @Length(3, 30)
  name: string

  @IsOptional()
  @Length(0, 0)
  cover?: string

  @IsOptional()
  @IsBoolean()
  @Transform((val: string) => [true, 'true', 1, '1'].indexOf(val) > -1)
  isPrivate?: boolean

  userId: string
}
