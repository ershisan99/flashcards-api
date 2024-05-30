import { Pagination } from '../../../infrastructure/common/pagination/pagination.dto'

export class Deck {
  id: string
  userId: string
  name: string
  isPrivate: boolean
  cover: string | null
  created: Date
  updated: Date
  cardsCount: number
}

export class DeckWithAuthor extends Deck {
  author: DeckAuthor
}

export class DeckWithAuthorAndFavorites extends DeckWithAuthor {
  isFavorite: boolean
}

export class DeckWithFavorites extends Deck {
  isFavorite: boolean
}

export class DeckAuthor {
  id: string
  name: string
}

export class PaginatedDecksWithMaxCardsCount {
  items: DeckWithAuthorAndFavorites[]
  pagination: Pagination
  maxCardsCount: number
}

export class PaginatedDecks {
  items: DeckWithAuthorAndFavorites[]
  pagination: Pagination
}
