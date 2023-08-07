import { IsBoolean, IsEmail, IsOptional, Length } from 'class-validator'

export class LoginDto {
  @Length(3, 30)
  password: string

  @IsEmail()
  email: string

  @IsBoolean()
  @IsOptional()
  rememberMe: boolean
}
