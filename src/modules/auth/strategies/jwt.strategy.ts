import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request as RequestType } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { AppSettings } from '../../../settings/app-settings'
import { UsersService } from '../../users/services/users.service'
import { AuthService } from '../auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AppSettings.name) private readonly appSettings: AppSettings,
    private authService: AuthService,
    private userService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: appSettings.auth.ACCESS_JWT_SECRET_KEY,
    })
  }

  async validate(payload: any) {
    const user = await this.userService.getUserById(payload.userId)

    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.cookies && 'accessToken' in req.cookies && req.cookies.accessToken.length > 0) {
      return req.cookies.accessToken
    }

    return null
  }
}
