import { Pagination } from '../../../infrastructure/common/pagination/pagination.dto'

export class Deck {
  id: string
  userId: string
  name: string
  isPrivate: boolean
  shots: number
  cover: string | null
  rating: number
  created: Date
  updated: Date
  cardsCount: number
}

export class DeckWithAuthor extends Deck {
  author: DeckAuthor
}

export class DeckAuthor {
  id: string
  name: string
}

export class PaginatedDecks {
  items: DeckWithAuthor[]
  pagination: Pagination
  maxCardsCount: number
}
