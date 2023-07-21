import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator'

export class RegistrationDto {
  @Length(3, 30)
  @IsOptional()
  name?: string

  @Length(3, 30)
  password: string

  @IsEmail()
  email: string

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
  /** Whether to send a confirmation email or not.
   * Defaults to false
   * @example false
   */
  @IsOptional()
  @IsBoolean()
  sendConfirmationEmail?: boolean
}
