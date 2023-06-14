import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from '../auth.service'
import { AppSettings } from '../../../settings/app-settings'
import { UsersService } from '../../users/services/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AppSettings.name) private readonly appSettings: AppSettings,
    private authService: AuthService,
    private userService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appSettings.auth.ACCESS_JWT_SECRET_KEY,
    })
  }

  async validate(payload: any) {
    console.log(payload)
    const user = await this.userService.getUserById(payload.userId)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
