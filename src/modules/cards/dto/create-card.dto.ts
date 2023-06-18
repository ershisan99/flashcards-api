import { Length } from 'class-validator'

export class CreateCardDto {
  @Length(3, 500)
  question: string

  @Length(3, 500)
  answer: string
}
