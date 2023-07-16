import { IsUUID } from 'class-validator'

export class EmailVerificationDto {
  @IsUUID('4')
  code: string
}
