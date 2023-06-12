import { Module } from '@nestjs/common';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';
import { JwtPayloadExtractorStrategy } from './guards/common/jwt-payload-extractor.strategy';
import { JwtPayloadExtractorGuard } from './guards/common/jwt-payload-extractor.guard';
import { ConfigModule } from './settings/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [ConfigModule, AuthModule, UsersModule, PrismaModule],
  controllers: [],
  providers: [
    JwtStrategy,
    JwtPayloadExtractorStrategy,
    JwtPayloadExtractorGuard,
  ],
  exports: [],
})
export class AppModule {}
