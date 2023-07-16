import { IsOptional, Length } from 'class-validator'

export class CreateCardDto {
  @Length(3, 500)
  question: string

  @Length(3, 500)
  answer: string

  @IsOptional()
  @Length(0, 0)
  questionImg?: string

  @IsOptional()
  @Length(0, 0)
  answerImg?: string

  @IsOptional()
  @Length(3, 500)
  questionVideo?: string

  @IsOptional()
  @Length(3, 500)
  answerVideo?: string
}
