import { ExecutionContext, Injectable, UsePipes, ValidationPipe } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super()
  }

  @UsePipes(new ValidationPipe())
  validateLoginDto(): void {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()

    const res: boolean = await (super.canActivate(context) as Promise<boolean>)
    if (!res) return false

    // check DTO
    return res
  }
}
