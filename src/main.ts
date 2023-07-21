import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './exception.filter'
import { pipesSetup } from './settings/pipes-setup'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: true,
    credentials: true,
  })
  app.use(cookieParser())

  app.setGlobalPrefix('v1')
  const config = new DocumentBuilder()
    .setTitle('Flashcards')
    .setDescription('Flashcards API')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Decks')
    .addTag('Cards')
    .addTag('Admin')
    .build()
  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('docs', app, document, {
    customJs: '/swagger-ui.js',
    customCssUrl: '/swagger-themes/dark.css',
  })
  pipesSetup(app)
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(process.env.PORT || 3000)
  const logger = new Logger('NestApplication')

  logger.log(`Application is running on: ${await app.getUrl()}`)
}

try {
  void bootstrap()
} catch (e) {
  console.log('BOOTSTRAP CALL FAILED')
  console.log('ERROR: ')
  console.log(e)
}
