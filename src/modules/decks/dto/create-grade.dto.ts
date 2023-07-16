import { IsUUID, Max, Min } from 'class-validator'

export class CreateGradeDto {
  @Min(1)
  @Max(5)
  grade: number

  @IsUUID()
  cardId: string
}
