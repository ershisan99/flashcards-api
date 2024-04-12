import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID } from 'class-validator'

import { ApiSchema } from '../../../infrastructure/common/helpers/api-schema'

@ApiSchema({ name: 'ResendVerificationEmailRequest' })
export class ResendVerificationEmailDto {
  @IsUUID()
  userId: string

  @ApiProperty({
    description: `HTML template to be sent in the email;\n ##name## will be replaced with the user's name; \n ##token## will be replaced with the password recovery token`,
    example: `<b>Hello, ##name##!</b><br/>Please confirm your email by clicking on the link below:<br/><a href="http://localhost:3000/confirm-email/##token##">Confirm email</a>. If it doesn't work, copy and paste the following link in your browser:<br/>http://localhost:3000/confirm-email/##token##`,
  })
  @IsOptional()
  @IsString()
  html?: string

  /** Email subject */
  @IsOptional()
  @IsString()
  subject?: string
}
