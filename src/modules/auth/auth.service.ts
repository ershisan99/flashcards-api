import * as process from 'process'

import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { addDays } from 'date-fns'
import * as jwt from 'jsonwebtoken'

import { PrismaService } from '../../prisma.service'
import { UsersRepository } from '../users/infrastructure/users.repository'

@Injectable()
export class AuthService {
  constructor(private usersRepository: UsersRepository, private prisma: PrismaService) {}

  async createJwtTokensPair(userId: string, rememberMe?: boolean) {
    const accessSecretKey = process.env.ACCESS_JWT_SECRET_KEY
    const refreshSecretKey = process.env.REFRESH_JWT_SECRET_KEY

    const accessExpiresIn = rememberMe ? '1d' : '10m'

    const payload: { userId: string; date: Date } = {
      userId,
      date: new Date(),
    }
    const accessToken = jwt.sign(payload, accessSecretKey, { expiresIn: accessExpiresIn })
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

  async checkCredentials(email: string, password: string, rememberMe?: boolean) {
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
    const tokensPair = await this.createJwtTokensPair(user.id, rememberMe)

    return {
      resultCode: 0,
      data: tokensPair,
    }
  }

  private async isPasswordCorrect(password: string, hash: string) {
    return bcrypt.compare(password, hash)
  }
}
