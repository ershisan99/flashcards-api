import { IsEmail, IsOptional, Length } from 'class-validator'

export class RegistrationDto {
  @Length(3, 30)
  @IsOptional()
  name?: string

  @Length(3, 30)
  password: string

  @IsEmail()
  email: string
}
