import { IsOptionalOrEmptyString } from '../../../infrastructure/decorators'

export class GetRandomCardDto {
  @IsOptionalOrEmptyString()
  previousCardId?: string
}
