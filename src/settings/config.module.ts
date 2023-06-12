import { Global, Module } from '@nestjs/common';
import { appSettings, AppSettings } from './app-settings';

//главный config модуль для управления env переменными импортируется в app.module.ts глобально
//поскольку он глобальный то импортировать в каждый модуль его не надо
@Global()
@Module({
  providers: [
    {
      provide: AppSettings.name,
      useFactory: () => appSettings,
    },
  ],
  exports: [AppSettings.name],
})
export class ConfigModule {}
