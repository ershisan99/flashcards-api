import { IsUUID } from 'class-validator'

import { ApiSchema } from '../../../infrastructure/common/helpers/api-schema'

@ApiSchema({ name: 'EmailVerificationRequest' })
export class EmailVerificationDto {
  @IsUUID('4')
  code: string
}
