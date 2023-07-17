import { isObject } from 'remeda'

import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from './pagination.constants'
interface PaginationQuery {
  currentPage?: string
  itemsPerPage?: string
}
export class Pagination {
  static getPaginationData<T extends Partial<PaginationQuery>>(
    query: T
  ): { currentPage: number; itemsPerPage: number } & Omit<T, keyof PaginationQuery> {
    if (!isObject(query)) throw new Error('Pagination.getPaginationData: query is not an object')

    const currentPage =
      'currentPage' in query &&
      typeof query.currentPage === 'string' &&
      !isNaN(Number(query.currentPage))
        ? +query.currentPage
        : DEFAULT_PAGE_NUMBER

    const itemsPerPage =
      'itemsPerPage' in query &&
      typeof query.itemsPerPage === 'string' &&
      !isNaN(Number(query.itemsPerPage))
        ? +query.itemsPerPage
        : DEFAULT_PAGE_SIZE

    const { currentPage: _, itemsPerPage: __, ...rest } = query

    return { currentPage, itemsPerPage, ...rest }
  }

  static transformPaginationData<T>(
    [count, items]: [number, T],
    {
      currentPage,
      itemsPerPage,
    }: {
      currentPage: number
      itemsPerPage: number
    }
  ) {
    const totalPages = Math.ceil(count / itemsPerPage)

    return {
      pagination: {
        totalPages,
        currentPage,
        itemsPerPage,
        totalItems: count,
      },
      items,
    }
  }
}
