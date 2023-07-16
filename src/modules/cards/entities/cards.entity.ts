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
  rating: number
  created: Date
  updated: Date
}

export class PaginatedCards {
  items: Card[]
  pagination: Pagination
}
