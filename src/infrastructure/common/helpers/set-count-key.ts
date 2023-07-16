import { omit } from 'remeda'

export const setCountKey = <K extends string, L extends string>(key: K, newKey: L) => {
  return <T extends Record<string, any>>(obj: T) => {
    obj[newKey] = obj['_count'][key]

    return omit(obj, ['_count']) as Omit<T, '_count'> & { [P in L]: number }
  }
}
