import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { UsersService } from '../../users/services/users.service'
import { AppSettings } from '../../../settings/app-settings'
import { Request } from 'express'

const cookieExtractor = function (req: Request) {
  let token = null
  if (req && req.cookies) {
    token = req.cookies['refreshToken']
  }
  return token
}

// ...
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject(AppSettings.name) private readonly appSettings: AppSettings,
    private userService: UsersService
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: true,
      secretOrKey: appSettings.auth.REFRESH_JWT_SECRET_KEY,
    })
  }

  async validate(payload: any) {
    return this.userService.getUserById(payload.userId)
  }
}
