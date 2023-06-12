import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class BaseAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const exceptedAuthInput = 'Basic YWRtaW46cXdlcnR5'
    if (!request.headers || !request.headers.authorization) {
      throw new UnauthorizedException([{ message: 'No any auth headers' }])
    } else {
      if (request.headers.authorization != exceptedAuthInput) {
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
