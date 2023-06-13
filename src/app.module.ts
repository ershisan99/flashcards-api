import { Module } from '@nestjs/common'
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy'
import { JwtPayloadExtractorStrategy } from './guards/common/jwt-payload-extractor.strategy'
import { JwtPayloadExtractorGuard } from './guards/common/jwt-payload-extractor.guard'
import { ConfigModule } from './settings/config.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { PrismaModule } from './prisma.module'
import { MailerModule } from '@nestjs-modules/mailer'
import * as process from 'process'

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
  providers: [JwtStrategy, JwtPayloadExtractorStrategy, JwtPayloadExtractorGuard],
  exports: [],
})
export class AppModule {}
