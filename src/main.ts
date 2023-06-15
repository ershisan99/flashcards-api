import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common'
import { HttpExceptionFilter } from './exception.filter'
import * as cookieParser from 'cookie-parser'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('v1')
  const config = new DocumentBuilder()
    .setTitle('Flashcards')
    .setDescription('The config API description')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: false,
      exceptionFactory: errors => {
        const customErrors = errors.map(e => {
          const firstError = JSON.stringify(e.constraints)
          return { field: e.property, message: firstError }
        })
        throw new BadRequestException(customErrors)
      },
    })
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  app.use(cookieParser())
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
