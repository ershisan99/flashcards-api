import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'

import { JwtAuthGuard } from './jwt-auth.guard'

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context)

    if (!canActivate) {
      return false
    }
    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user.isAdmin) {
      throw new UnauthorizedException('You do not have permission to access this resource')
    }

    return true
  }
}
