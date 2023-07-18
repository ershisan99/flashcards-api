import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString } from 'class-validator'

export class RecoverPasswordDto {
  /** User's email address */
  @IsEmail()
  email: string

  @ApiProperty({
    description: `HTML template to be sent in the email;\n ##name## will be replaced with the user's name; \n ##token## will be replaced with the password recovery token`,
    example:
      '<h1>Hi, ##name##</h1><p>Click <a href="##token##">here</a> to recover your password</p>',
  })
  @IsString()
  @IsOptional()
  html?: string

  /** Email subject */
  @IsString()
  @IsOptional()
  subject?: string
}
