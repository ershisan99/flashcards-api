import { Injectable, Logger } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import * as bcrypt from 'bcrypt'

import { UsersRepository } from '../infrastructure/users.repository'

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository, private emailService: MailerService) {}

  private logger = new Logger(UsersService.name)

  async getUsers(page: number, pageSize: number, name: string, email: string) {
    return await this.usersRepository.getUsers(page, pageSize, name, email)
  }

  async getUserById(id: string) {
    return await this.usersRepository.findUserById(id)
  }

  async deleteUserById(id: string): Promise<boolean> {
    return await this.usersRepository.deleteUserById(id)
  }

  async deleteAllUsers(): Promise<{ deleted: number }> {
    const deleted = await this.usersRepository.deleteAllUsers()

    return { deleted }
  }

  public async sendConfirmationEmail({
    email,
    name,
    verificationToken,
    html = `<b>Hello, ##name##!</b><br/>Please confirm your email by clicking on the link below:<br/><a href="http://localhost:3000/confirm-email/##token##">Confirm email</a>. If it doesn't work, copy and paste the following link in your browser:<br/>http://localhost:3000/confirm-email/##token##`,
    subject = 'E-mail confirmation',
  }: {
    email: string
    name: string
    verificationToken: string
    html?: string
    subject?: string
  }) {
    const htmlFinal = html.replaceAll('##token##', verificationToken)?.replaceAll('##name##', name)

    try {
      await this.emailService.sendMail({
        from: 'andrii <andrii@andrii.es>',
        to: email,
        html: htmlFinal,
        subject,
      })
    } catch (e) {
      this.logger.error(e?.message || e)
      this.logger.error(e?.stack || e)
      this.logger.error(JSON.stringify(e))
    }
  }

  public async sendPasswordRecoveryEmail({
    email,
    name,
    passwordRecoveryToken,
    html,
    subject,
  }: {
    email: string
    name: string
    html?: string
    subject?: string
    passwordRecoveryToken: string
  }) {
    const htmlFinal =
      html?.replace('##token##', passwordRecoveryToken)?.replace('##name##', name) ||
      `<b>Hello ${name}!</b><br/>To recover your password follow this link:<br/><a href="http://localhost:3000/confirm-email/${passwordRecoveryToken}">Confirm email</a>. If it doesn't work, copy and paste the following link in your browser:<br/>http://localhost:3000/confirm-email/${passwordRecoveryToken} `

    try {
      await this.emailService.sendMail({
        from: 'Andrii <andrii@andrii.es>',
        to: email,
        html: htmlFinal,
        subject: subject || 'Password recovery',
      })
    } catch (e) {
      this.logger.error(e?.message || e)
      this.logger.error(e?.stack || e)
      this.logger.error(JSON.stringify(e))
    }
  }

  public async generateHash(password: string) {
    return await bcrypt.hash(password, 10)
  }
}
