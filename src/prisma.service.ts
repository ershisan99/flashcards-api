import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: [
        {
          emit: 'stdout',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  private exitHandler(app: INestApplication) {
    return async () => {
      await app.close()
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('exit', this.exitHandler(app))
    process.on('beforeExit', this.exitHandler(app))
    process.on('SIGINT', this.exitHandler(app))
    process.on('SIGTERM', this.exitHandler(app))
    process.on('SIGUSR2', this.exitHandler(app))
  }
}
