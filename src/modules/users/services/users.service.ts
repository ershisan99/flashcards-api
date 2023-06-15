import { Injectable, Logger } from '@nestjs/common'
import { UsersRepository } from '../infrastructure/users.repository'
import * as bcrypt from 'bcrypt'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository, private emailService: MailerService) {}

  private logger = new Logger(UsersService.name)

  async getUsers(page: number, pageSize: number, searchNameTerm: string, searchEmailTerm: string) {
    return await this.usersRepository.getUsers(page, pageSize, searchNameTerm, searchEmailTerm)
  }

  async getUserById(id: string) {
    return await this.usersRepository.findUserById(id)
  }

  async deleteUserById(id: string): Promise<boolean> {
    return await this.usersRepository.deleteUserById(id)
  }

  async deleteAllUsers(): Promise<boolean> {
    return await this.usersRepository.deleteAllUsers()
  }

  public async sendConfirmationEmail({
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
        subject: 'E-mail confirmation',
      })
    } catch (e) {
      this.logger.error(e)
    }
  }

  public async generateHash(password: string) {
    return await bcrypt.hash(password, 10)
  }
}
