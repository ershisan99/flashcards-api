import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, Length } from 'class-validator'

export class CreateDeckDto {
  @Length(3, 30)
  name: string
  /**
   * Cover image (binary)
   */
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary' })
  cover?: string

  /**
   * Private decks are not visible to other users
   */
  @IsOptional()
  @IsBoolean()
  @Transform((val: string) => [true, 'true', 1, '1'].indexOf(val) > -1)
  isPrivate?: boolean

  @ApiHideProperty()
  userId: string
}
