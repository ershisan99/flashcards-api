import { Length } from 'class-validator'

export class ResetPasswordDto {
  @Length(3, 30)
  password: string
}
