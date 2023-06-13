import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AppSettings } from '../../settings/app-settings'
import { AuthService } from '../../modules/auth/auth.service'

@Injectable()
export class JwtPayloadExtractorStrategy extends PassportStrategy(Strategy, 'payloadExtractor') {
  constructor(
    @Inject(AppSettings.name) private readonly appSettings: AppSettings,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appSettings.auth.ACCESS_JWT_SECRET_KEY,
    })
  }

  async validate(payload: any) {
    console.log(payload)
    const userId = payload.userId
    const name = payload.name
    if (payload) return { userId, name }
    return null
  }
}
