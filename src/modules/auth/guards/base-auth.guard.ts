import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class BaseAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const acceptedAuthInput =
      'Basic ' +
      Buffer.from(`${process.env.ADMIN_LOGIN}:${process.env.ADMIN_PASSWORD}`).toString('base64')

    if (!request.headers || !request.headers.authorization) {
      throw new UnauthorizedException([{ message: 'No auth headers found' }])
    } else {
      if (request.headers.authorization != acceptedAuthInput) {
        throw new UnauthorizedException([
          {
            message: 'login or password invalid',
          },
        ])
      }
    }

    return true
  }
}
