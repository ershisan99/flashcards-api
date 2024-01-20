import { Pagination } from '../../../infrastructure/common/pagination/pagination.dto'

export class Card {
  id: string
  deckId: string
  userId: string
  question: string
  answer: string
  shots: number
  answerImg: string
  questionImg: string
  questionVideo: string
  answerVideo: string
  created: Date
  updated: Date
}

export class PaginatedCards {
  items: Card[]
  pagination: Pagination
}

export class PaginatedCardsWithGrades {
  pagination: Pagination
  items: CardWithGrades[]
}

export class CardWithGrades extends Card {
  grades?: Array<{ grade: number }>
}

export class PaginatedCardsWithGrade {
  pagination: Pagination
  items: CardWithGrade[]
}

export class CardWithGrade extends Card {
  grade: number
}
