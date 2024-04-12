import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, Length } from 'class-validator'

import { ApiSchema } from '../../../infrastructure/common/helpers/api-schema'

@ApiSchema({ name: 'CreateDeckRequest' })
export class CreateDeckDto {
  @Length(3, 30)
  name: string
  /**
   * Cover image (has to be sent inside FormData, does NOT accept base64)
   */
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary' })
  cover?: string

  /**
   * Private decks are not visible to other users
   */
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => [true, 'true', 1, '1'].indexOf(value) > -1)
  isPrivate?: boolean

  @ApiHideProperty()
  userId: string
}
