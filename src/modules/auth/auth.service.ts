import { Injectable } from '@nestjs/common'
import { isAfter } from 'date-fns'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { UsersRepository } from '../users/infrastructure/users.repository'
import * as process from 'process'

@Injectable()
export class AuthService {
  constructor(private usersRepository: UsersRepository) {}

  createJwtTokensPair(userId: string, email: string | null) {
    const accessSecretKey = process.env.ACCESS_JWT_SECRET_KEY
    const refreshSecretKey = process.env.REFRESH_JWT_SECRET_KEY
    const payload: { userId: string; date: Date; email: string | null } = {
      userId,
      date: new Date(),
      email,
    }
    const accessToken = jwt.sign(payload, accessSecretKey, { expiresIn: '1d' })
    const refreshToken = jwt.sign(payload, refreshSecretKey, {
      expiresIn: '30d',
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
    const tokensPair = this.createJwtTokensPair(user.id, user.email)
    return {
      resultCode: 0,
      data: tokensPair,
    }
  }

  private async isPasswordCorrect(password: string, hash: string) {
    return bcrypt.compare(password, hash)
  }

  async confirmEmail(token: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByVerificationToken(token)
    if (!user || user.isEmailVerified) return false
    const dbToken = user.verificationToken
    const isTokenExpired = isAfter(user.verificationTokenExpiry, new Date())
    if (dbToken !== token || isTokenExpired) {
      return false
    }

    return await this.usersRepository.updateConfirmation(user.id)
  }

  async resendCode(email: string) {
    const user = await this.usersRepository.findUserByEmail(email)
    if (!user || user?.verification.isEmailVerified) return null
    const updatedUser = await this.usersRepository.updateVerificationToken(user.id)
    if (!updatedUser) return null

    return true
  }
}
