import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

import { ApiSchema } from '../../../infrastructure/common/helpers/api-schema'
import { IsOptionalOrEmptyString } from '../../../infrastructure/decorators'

import { CreateDeckDto } from './create-deck.dto'

@ApiSchema({ name: 'UpdateDeckRequest' })
export class UpdateDeckDto extends PartialType(CreateDeckDto) {
  @IsOptionalOrEmptyString()
  name?: string

  @IsOptionalOrEmptyString()
  @IsBoolean()
  isPrivate?: boolean

  /**
   * Cover image (has to be sent inside FormData, does NOT accept base64)
   */
  @IsOptionalOrEmptyString()
  @ApiProperty({ type: 'string', format: 'binary' })
  cover?: string
}
