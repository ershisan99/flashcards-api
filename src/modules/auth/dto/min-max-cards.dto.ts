import { ApiHideProperty } from '@nestjs/swagger'

import { ApiSchema } from '../../../infrastructure/common/helpers/api-schema'
import { IsOptionalOrEmptyString } from '../../../infrastructure/decorators'
import { IsUUIDOrCaller } from '../../../infrastructure/decorators/is-uuid-or-caller'

@ApiSchema({ name: 'MinMaxCardsRequestArgs' })
export class GetMinMaxCardsDto {
  /** Search by deck name */
  @IsOptionalOrEmptyString()
  name?: string

  /** Filter by deck authorId
   * If ~caller is passed, it will be replaced with the current user's id
   */
  @IsOptionalOrEmptyString()
  @IsUUIDOrCaller()
  authorId?: string

  /** Decks favorited by user
   * If ~caller is passed, it will be replaced with the current user's id
   * */
  @IsOptionalOrEmptyString()
  @IsUUIDOrCaller()
  favoritedBy?: string

  @ApiHideProperty()
  userId?: string
}
