import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { HttpStatus } from '@nestjs/common'
import { AppModule } from '../../../../app.module'
import { RegistrationDto } from '../../dto/registration.dto'

describe('AuthController (e2e)', () => {
  let app

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/POST sign-up', () => {
    const registrationData: RegistrationDto = {
      name: 'John',
      email: 'john@gmail.com',
      password: 'secret',
    }

    return request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(registrationData)
      .expect(HttpStatus.CREATED)
  })

  it('/POST sign-up (duplicate)', () => {
    const registrationData: RegistrationDto = {
      name: 'John',
      email: 'john@gmail.com',
      password: 'secret',
    }

    return request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(registrationData)
      .expect(HttpStatus.BAD_REQUEST)
  })

  it('/POST login', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'john@gmail.com', password: 'secret' })
      .expect(HttpStatus.OK)
      .then(response => {
        expect(response.body.accessToken).toBeDefined()
      })
  })

  it('/POST login (invalid)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'john@gmail.com', password: 'wrong_password' })
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it('/GET me', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'john@gmail.com', password: 'secret' })
      .expect(HttpStatus.OK)

    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(HttpStatus.OK)
  })
  it('/POST verify-email', async () => {
    // Assuming "john@gmail.com" has a verification code "123456"
    return request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ code: '123456' })
      .expect(HttpStatus.OK)
  })

  it('/POST verify-email (invalid)', () => {
    return request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ code: 'wrong_code' })
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it('/POST resend-verification-email', async () => {
    // Assuming "john@gmail.com" has a user ID "1"
    return request(app.getHttpServer())
      .post('/auth/resend-verification-email')
      .send({ userId: '1' })
      .expect(HttpStatus.OK)
  })

  it('/POST logout', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'john@gmail.com', password: 'secret' })
      .expect(HttpStatus.OK)

    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', [`refreshToken=${loginResponse.body.refreshToken}`])
      .expect(HttpStatus.OK)
  })

  it('/GET refresh-token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'john@gmail.com', password: 'secret' })
      .expect(HttpStatus.OK)

    return request(app.getHttpServer())
      .get('/auth/refresh-token')
      .set('Cookie', [`refreshToken=${loginResponse.body.refreshToken}`])
      .expect(HttpStatus.OK)
      .then(response => {
        expect(response.body.accessToken).toBeDefined()
      })
  })

  it('/POST recover-password', () => {
    return request(app.getHttpServer())
      .post('/auth/recover-password')
      .send({ email: 'john@gmail.com' })
      .expect(HttpStatus.OK)
  })

  it('/POST reset-password/:token', () => {
    // Assuming "john@gmail.com" has a password reset token "abcdef"
    return request(app.getHttpServer())
      .post('/auth/reset-password/abcdef')
      .send({ password: 'new_password' })
      .expect(HttpStatus.OK)
  })

  // Add more tests for the other endpoints in a similar way

  afterAll(async () => {
    await app.close()
  })
})
