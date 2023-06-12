import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppSettings } from '../../../settings/app-settings';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AppSettings.name) private readonly appSettings: AppSettings,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: appSettings.auth.ACCESS_JWT_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId };
  }
}
