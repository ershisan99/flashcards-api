import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passReqToCallback: true,
    })
  }

  async validate(req: any, email: string, password: string): Promise<any> {
    const rememberMe = req?.body?.rememberMe || false
    const newCredentials = await this.authService.checkCredentials(email, password, rememberMe)

    if (newCredentials.resultCode === 1) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return newCredentials
  }
}
