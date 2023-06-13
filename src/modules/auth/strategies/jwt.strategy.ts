import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AppSettings } from '../../../settings/app-settings'
import { Request } from 'express'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AppSettings.name) private readonly appSettings: AppSettings) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appSettings.auth.ACCESS_JWT_SECRET_KEY,
    })
  }

  async validate(request: Request, payload: any) {
    const accessToken = request.headers.authorization?.split(' ')[1]
    const refreshToken = request.cookies.refreshToken // Extract refresh token from cookies

    // If there's no refresh token, simply validate the user based on payload
    if (!refreshToken) {
      return { userId: payload.userId }
    }

    try {
      const newAccessToken = await this.authService.checkToken(accessToken, refreshToken)

      // If new access token were issued, attach it to the response headers
      if (newAccessToken) {
        request.res.setHeader('Authorization', `Bearer ${newAccessToken.accessToken}`)
      }
      request.res.cookie('refreshToken', newAccessToken.refreshToken, {
        httpOnly: true,
        path: '/auth/refresh-token',
      })
      return { userId: payload.userId }
    } catch (error) {
      throw new UnauthorizedException('Invalid tokens')
    }
  }
}
