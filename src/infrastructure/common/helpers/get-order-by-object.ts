type OrderByDirection = 'asc' | 'desc'

export function createPrismaOrderBy(input: string | null) {
  const { key, direction, relation, field } = getOrderByObject(input)

  if (relation && field) {
    return {
      [relation]: {
        [field]: direction,
      },
    }
  }

  return {
    [key]: direction as OrderByDirection,
  }
}

export function getOrderByObject(input: string) {
  if (!input || input === 'null') {
    return undefined
  }
  const [key, direction] = input.split('-')

  if (!key || !direction) {
    throw new Error("Invalid format. Expected format is 'key-direction'")
  }

  if (direction !== 'asc' && direction !== 'desc') {
    throw new Error("Invalid direction. Expected 'asc' or 'desc'")
  }

  if (key.includes('.')) {
    const [relation, field] = key.split('.')

    return {
      relation,
      field,
      direction,
    }
  }

  return {
    key,
    direction: direction as OrderByDirection,
  }
}
