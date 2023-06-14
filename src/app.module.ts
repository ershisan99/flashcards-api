import { Module } from '@nestjs/common'
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy'
import { ConfigModule } from './settings/config.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { PrismaModule } from './prisma.module'
import { MailerModule } from '@nestjs-modules/mailer'
import * as process from 'process'
import { JwtRefreshStrategy } from './modules/auth/strategies/jwt-refresh.strategy'

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    AuthModule,
    PrismaModule,

    MailerModule.forRoot({
      transport: {
        host: process.env.AWS_SES_SMTP_HOST,
        port: +process.env.AWS_SES_SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.AWS_SES_SMTP_USER,
          pass: process.env.AWS_SES_SMTP_PASS,
        },
      },
    }),
  ],
  controllers: [],
  providers: [JwtStrategy, JwtRefreshStrategy],
  exports: [],
})
export class AppModule {}
