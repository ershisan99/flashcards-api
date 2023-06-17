export class Pagination {
  static getPaginationData(query) {
    const page = typeof query.PageNumber === 'string' ? +query.PageNumber : 1
    const pageSize = typeof query.PageSize === 'string' ? +query.PageSize : 10
    const searchNameTerm = typeof query.SearchNameTerm === 'string' ? query.SearchNameTerm : ''
    const searchEmailTerm = typeof query.SearchEmailTerm === 'string' ? query.SearchEmailTerm : ''
    return { page, pageSize, searchNameTerm, searchEmailTerm }
  }
}
