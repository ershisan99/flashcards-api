import { Injectable } from '@nestjs/common'
import { addDays } from 'date-fns'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { UsersRepository } from '../users/infrastructure/users.repository'
import * as process from 'process'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class AuthService {
  constructor(private usersRepository: UsersRepository, private prisma: PrismaService) {}

  async createJwtTokensPair(userId: string) {
    const accessSecretKey = process.env.ACCESS_JWT_SECRET_KEY
    const refreshSecretKey = process.env.REFRESH_JWT_SECRET_KEY
    const payload: { userId: string; date: Date } = {
      userId,
      date: new Date(),
    }
    const accessToken = jwt.sign(payload, accessSecretKey, { expiresIn: '10m' })
    const refreshToken = jwt.sign(payload, refreshSecretKey, {
      expiresIn: '30d',
    })
    await this.prisma.refreshToken.create({
      data: {
        userId: userId,
        token: refreshToken,
        expiresAt: addDays(new Date(), 30),
        isRevoked: false,
      },
    })
    return {
      accessToken,
      refreshToken,
    }
  }

  async checkCredentials(email: string, password: string) {
    const user = await this.usersRepository.findUserByEmail(email)
    if (!user /*|| !user.emailConfirmation.isConfirmed*/)
      return {
        resultCode: 1,
        data: {
          accessToken: null,
          refreshToken: null,
        },
      }
    const isPasswordValid = await this.isPasswordCorrect(password, user.password)
    if (!isPasswordValid) {
      return {
        resultCode: 1,
        data: {
          token: {
            accessToken: null,
            refreshToken: null,
          },
        },
      }
    }
    const tokensPair = await this.createJwtTokensPair(user.id)
    return {
      resultCode: 0,
      data: tokensPair,
    }
  }

  private async isPasswordCorrect(password: string, hash: string) {
    return bcrypt.compare(password, hash)
  }
}
