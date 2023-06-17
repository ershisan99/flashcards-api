import { IsBoolean, IsOptional, IsString, Length } from 'class-validator'

export class CreateDeckDto {
  @Length(3, 30)
  name: string

  @IsOptional()
  @IsString()
  cover?: string

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean

  userId: string
}
