import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppSettings } from '../../settings/app-settings';

@Injectable()
export class JwtPayloadExtractorStrategy extends PassportStrategy(
  Strategy,
  'payloadExtractor',
) {
  constructor(
    @Inject(AppSettings.name) private readonly appSettings: AppSettings,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appSettings.auth.ACCESS_JWT_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    const userId = payload.userId;
    const login = payload.login;
    if (payload) return { userId, login };
    return null;
  }
}
