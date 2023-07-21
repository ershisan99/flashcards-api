import { IsNumber, IsString, Max, Min } from 'class-validator'

export class SaveGradeDto {
  @IsString()
  cardId: string

  @IsNumber()
  @Max(5)
  @Min(1)
  grade: number
}
