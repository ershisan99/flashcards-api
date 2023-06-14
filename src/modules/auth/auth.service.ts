import { Injectable, UnauthorizedException } from '@nestjs/common'
import { addDays, isBefore } from 'date-fns'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { UsersRepository } from '../users/infrastructure/users.repository'
import * as process from 'process'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class AuthService {
  constructor(private usersRepository: UsersRepository, private prisma: PrismaService) {}

  async revokeToken(token: string, userId: string): Promise<void> {
    await this.prisma.revokedToken.create({
      data: {
        userId,
        token,
      },
    })
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    const revokedToken = await this.prisma.revokedToken.findUnique({
      where: { token },
    })
    return !!revokedToken
  }

  // Periodically remove old revoked tokens
  async removeExpiredTokens(): Promise<void> {
    const hourAgo = new Date()
    hourAgo.setHours(hourAgo.getHours() - 1)
    await this.prisma.revokedToken.deleteMany({
      where: { revokedAt: { lt: hourAgo } },
    })
  }

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
    console.log(refreshToken.length)
    // Save refresh token in the database
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

  async checkToken(accessToken: string, refreshToken: string) {
    try {
      await jwt.verify(accessToken, process.env.ACCESS_JWT_SECRET_KEY)
      return true
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        const dbRefreshToken = await this.prisma.refreshToken.findUnique({
          where: { token: refreshToken },
        })
        const isTokenRevoked = await this.isTokenRevoked(accessToken)
        if (isTokenRevoked) {
          throw new UnauthorizedException()
        }
        if (dbRefreshToken && !dbRefreshToken.isRevoked && dbRefreshToken.expiresAt > new Date()) {
          const newTokens = await this.createJwtTokensPair(dbRefreshToken.userId)
          await this.prisma.refreshToken.update({
            where: { id: dbRefreshToken.id },
            data: { isRevoked: true },
          })
          return newTokens
        }
      }
      throw err
    }
  }

  async logout(accessToken: string, refreshToken: string) {
    // Revoke the access token
    const decoded = jwt.verify(accessToken, process.env.ACCESS_JWT_SECRET_KEY)
    await this.revokeToken(accessToken, decoded.userId)
    await this.prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { isRevoked: true },
    })
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

  async confirmEmail(token: string): Promise<boolean> {
    const verificationWithUser = await this.usersRepository.findUserByVerificationToken(token)
    console.log(verificationWithUser)
    if (!verificationWithUser || verificationWithUser.isEmailVerified) return false
    const dbToken = verificationWithUser.verificationToken
    const isTokenExpired = isBefore(verificationWithUser.verificationTokenExpiry, new Date())
    console.log({ isTokenExpired })
    if (dbToken !== token || isTokenExpired) {
      return false
    }

    return await this.usersRepository.updateConfirmation(verificationWithUser.userId)
  }

  async resendCode(userId: string) {
    const user = await this.usersRepository.findUserById(userId)
    if (!user || user?.verification.isEmailVerified) return null
    const updatedUser = await this.usersRepository.updateVerificationToken(user.id)
    if (!updatedUser) return null

    return true
  }
}
