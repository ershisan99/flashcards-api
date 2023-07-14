import { IsUUID, Max, Min } from 'class-validator'

export class CreateDeckDto {
  @Min(1)
  @Max(5)
  grade: number

  @IsUUID()
  cardId: string
}
