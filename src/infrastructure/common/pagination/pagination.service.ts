import { isObject } from 'remeda'

export class Pagination {
  static getPaginationData<T>(query: T) {
    if (!isObject(query)) throw new Error('Pagination.getPaginationData: query is not an object')

    const currentPage =
      'currentPage' in query &&
      typeof query.currentPage === 'string' &&
      !isNaN(Number(query.currentPage))
        ? +query.currentPage
        : 1
    const itemsPerPage =
      'itemsPerPage' in query &&
      typeof query.itemsPerPage === 'string' &&
      !isNaN(Number(query.itemsPerPage))
        ? +query.itemsPerPage
        : 10
    return { currentPage, itemsPerPage, ...query }
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
