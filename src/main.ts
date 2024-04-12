import { Logger, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
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

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })
  const config = new DocumentBuilder()
    .setTitle('Flashcards')
    .addBearerAuth()
    .setDescription('Flashcards API')
    .setVersion('1.0')
    .addServer('https://api.flashcards.andrii.es')
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
  app.use(
    '/reference',
    apiReference({
      spec: {
        content: document,
      },
      authentication: {
        preferredSecurityScheme: 'bearer',
        http: {
          basic: {
            username: 'Basic',
            password: 'Basic',
          },
          bearer: {
            token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmMmJlOTViOS00ZDA3LTQ3NTEtYTc3NS1iZDYxMmZjOTU1M2EiLCJkYXRlIjoiMjAyMy0wOC0wNVQxMTowMjoxNC42MjFaIiwiaWF0IjoxNjkxMjMzMzM0LCJleHAiOjIwMDY4MDkzMzR9.PGTRcsf34VFaS-Hz7_PUnWR8bBuVK7pdteBWUUYHXfw',
          },
        },
      },
      theme: 'deepSpace',
      metaData: {
        title: 'Flashcards API Reference',
        ogTitle: 'Flashcards API Reference',
      },
    })
  )
  pipesSetup(app)
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(process.env.PORT || 3333)
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
