import { Length } from 'class-validator'

import { ApiSchema } from '../../../infrastructure/common/helpers/api-schema'

@ApiSchema({ name: 'ResetPasswordRequest' })
export class ResetPasswordDto {
  @Length(3, 30)
  password: string
}
