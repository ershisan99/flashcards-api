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
  rating: number
  created: Date
  updated: Date
}

export class PaginatedCards {
  items: Array<Omit<Card, 'userId' | 'rating'> & { grade: number }>
  pagination: Pagination
}

export class PaginatedCardsWithGrade {
  pagination: Pagination
  items: CardWithGrade[]
}
export class CardWithGrade extends Card {
  grades?: Array<{ grade: number }>
}
