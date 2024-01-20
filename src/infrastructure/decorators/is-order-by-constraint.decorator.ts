import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: false })
export class IsOrderByConstraint implements ValidatorConstraintInterface {
  validate(orderBy: string | null, args: ValidationArguments) {
    if (!orderBy || orderBy === 'null' || orderBy === '') {
      return true
    }
    const [key, direction] = orderBy.split('-')

    if (!key || !direction) {
      return false
    }

    if (direction !== 'asc' && direction !== 'desc') {
      return false
    }

    return true
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Invalid format. Expected format is "key-direction". Direction must be "asc" or "desc".'
  }
}

export function IsOrderBy(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: { constructor: Function }, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsOrderByConstraint,
    })
  }
}
