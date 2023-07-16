import { IsUUID } from 'class-validator'

export class ResendVerificationEmailDto {
  @IsUUID()
  userId: string
}
