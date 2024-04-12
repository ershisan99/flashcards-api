import { IsBoolean, IsEmail, IsOptional, Length } from 'class-validator'

import { ApiSchema } from '../../../infrastructure/common/helpers/api-schema'

@ApiSchema({ name: 'LoginRequest' })
export class LoginDto {
  @Length(3, 30)
  password: string

  @IsEmail()
  email: string

  @IsBoolean()
  @IsOptional()
  rememberMe: boolean
}
