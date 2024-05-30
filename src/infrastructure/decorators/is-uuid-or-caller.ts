import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { v4 as isUUID } from 'uuid'

@ValidatorConstraint({ async: false })
class IsUUIDOrCallerConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value === 'string') {
      return isUUID(value) || value === '~caller'
    }

    return false
  }

  defaultMessage() {
    return 'Text ($value) must be a UUID or the string "~caller"'
  }
}

export function IsUUIDOrCaller(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUUIDOrCallerConstraint,
    })
  }
}
