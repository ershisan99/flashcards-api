import { v4 as uuidv4 } from 'uuid'
import { CreateUserInput, EntityWithPaginationType, User, UserViewType } from '../../../types/types'
import { addHours } from 'date-fns'
import { Injectable } from '@nestjs/common'
import jwt from 'jsonwebtoken'
import { UsersRepository } from '../infrastructure/users.repository'
import * as bcrypt from 'bcrypt'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository, private emailService: MailerService) {}

  async getUsers(page: number, pageSize: number, searchNameTerm: string, searchEmailTerm: string) {
    return await this.usersRepository.getUsers(page, pageSize, searchNameTerm, searchEmailTerm)
  }

  async getUserById(id: string) {
    return await this.usersRepository.findUserById(id)
  }

  async createUser(name: string, password: string, email: string): Promise<UserViewType | null> {
    const passwordHash = await this._generateHash(password)
    const verificationToken = uuidv4()
    const newUser: CreateUserInput = {
      name: name || email.split('@')[0],
      email: email,
      password: passwordHash,
      verificationToken,
      verificationTokenExpiry: addHours(new Date(), 24),
      isEmailVerified: false,
    }
    const createdUser = await this.usersRepository.createUser(newUser)
    if (!createdUser) {
      return null
    }
    await this.sendConfirmationEmail({
      email: createdUser.email,
      name: createdUser.name,
      verificationToken: verificationToken,
    })
    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    }
  }
  async resendConfirmationEmail(userId: string) {
    const user = await this.usersRepository.findUserById(userId, { verification: true })
    if (!user) {
      return null
    }
    if (user.isEmailVerified) {
      return null
    }
    await this.sendConfirmationEmail({
      email: user.email,
      name: user.name,
      verificationToken: user.verification.verificationToken,
    })
    return true
  }
  async deleteUserById(id: string): Promise<boolean> {
    return await this.usersRepository.deleteUserById(id)
  }

  async deleteAllUsers(): Promise<boolean> {
    return await this.usersRepository.deleteAllUsers()
  }

  async addRevokedToken(token: string) {
    const secretKey = process.env.JWT_SECRET_KEY
    if (!secretKey) throw new Error('JWT_SECRET_KEY is not defined')

    try {
      const decoded: any = jwt.verify(token, secretKey)
      return this.usersRepository.revokeToken(decoded.userId, token)
    } catch (e) {
      console.log(`Decoding error: ${e}`)
      return null
    }
  }
  private async sendConfirmationEmail({
    email,
    name,
    verificationToken,
  }: {
    email: string
    name: string
    verificationToken: string
  }) {
    try {
      await this.emailService.sendMail({
        from: 'andrii <andrii@andrii.es>',
        to: email,
        text: 'hello and welcome, token is: ' + verificationToken,
        html: `<b>Hello ${name}!</b><br/>Please confirm your email by clicking on the link below:<br/><a href="http://localhost:3000/confirm-email/${verificationToken}">Confirm email</a>`,
        subject: 'E-mail confirmation ',
      })
    } catch (e) {
      console.log(e)
    }
  }
  private async _generateHash(password: string) {
    return await bcrypt.hash(password, 10)
  }
}

export interface IUsersRepository {
  getUsers(
    page: number,
    pageSize: number,
    searchNameTerm: string,
    searchEmailTerm: string
  ): Promise<EntityWithPaginationType<UserViewType>>

  createUser(newUser: CreateUserInput): Promise<User | null>

  deleteUserById(id: string): Promise<boolean>

  // findUserById(id: string): Promise<User | null>

  revokeToken(id: string, token: string): Promise<User | null>
}
