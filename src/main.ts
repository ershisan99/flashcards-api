import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger } from '@nestjs/common'
import { HttpExceptionFilter } from './exception.filter'
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
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
    .setDescription('The config API description')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)
  pipesSetup(app)
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(process.env.PORT || 3000)
  const logger = new Logger('NestApplication')
  logger.log(`Application is running on: ${await app.getUrl()}`)
}

try {
  bootstrap()
} catch (e) {
  console.log('BOOTSTRAP CALL FAILED')
  console.log('ERROR: ')
  console.log(e)
}
