import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { AppSettings } from '../../../settings/app-settings'

type JwtPayload = {
  userId: string
  username: string
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(AppSettings.name) private readonly appSettings: AppSettings) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appSettings.auth.ACCESS_JWT_SECRET_KEY,
    })
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.userId }
  }
}
