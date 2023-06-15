import {
  CreateUserInput,
  EntityWithPaginationType,
  User,
  UserViewType,
  VerificationWithUser,
} from '../../../types/types'
import { Injectable } from '@nestjs/common'
import { addHours } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from '../../../prisma.service'
import { pick } from 'remeda'
import { Prisma } from '@prisma/client'

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async getUsers(
    currentPage: number,
    itemsPerPage: number,
    searchNameTerm: string,
    searchEmailTerm: string
  ): Promise<EntityWithPaginationType<UserViewType>> {
    const where = {
      name: {
        search: searchNameTerm || undefined,
      },
      email: {
        search: searchEmailTerm || undefined,
      },
    }
    const [totalItems, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
      }),
    ])

    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const usersView = users.map(u => pick(u, ['id', 'name', 'email', 'isEmailVerified']))
    return {
      totalPages,
      currentPage,
      itemsPerPage,
      totalItems,
      items: usersView,
    }
  }

  async createUser(newUser: CreateUserInput): Promise<User | null> {
    return await this.prisma.user.create({
      data: {
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        verification: {
          create: {
            verificationToken: newUser.verificationToken,
            verificationTokenExpiry: newUser.verificationTokenExpiry,
          },
        },
      },
      include: {
        verification: true,
      },
    })
  }

  async deleteUserById(id: string): Promise<boolean> {
    const result = await this.prisma.user.delete({
      where: {
        id,
      },
    })
    return result.isDeleted
  }

  async deleteAllUsers(): Promise<boolean> {
    const result = await this.prisma.user.deleteMany()
    return result.count > 0
  }

  async findUserById(id: string, include?: Prisma.UserInclude) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include,
    })
    if (!user) {
      return null
    }

    return user as Prisma.UserGetPayload<{ include: typeof include }>
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { verification: true },
    })

    if (!user) {
      return null
    }
    return user
  }

  async findUserByVerificationToken(token: string): Promise<VerificationWithUser | null> {
    const verification = await this.prisma.verification.findUnique({
      where: {
        verificationToken: token,
      },
      include: {
        user: true,
      },
    })
    if (!verification) {
      return null
    }
    return verification
  }

  async updateEmailVerification(id: string) {
    const result = await this.prisma.verification.update({
      where: {
        userId: id,
      },
      data: {
        isEmailVerified: true,
        user: {
          update: {
            isEmailVerified: true,
          },
        },
      },
    })
    return result.isEmailVerified
  }

  async updateVerificationToken(id: string) {
    return await this.prisma.verification.update({
      where: {
        userId: id,
      },
      data: {
        verificationToken: uuidv4(),
        verificationTokenExpiry: addHours(new Date(), 24),
      },
      include: {
        user: true,
      },
    })
  }

  async revokeToken(id: string, token: string): Promise<User | null> {
    const revokedToken = await this.prisma.revokedToken.create({
      data: {
        token: token,
        userId: id,
      },
      include: {
        user: true,
      },
    })
    if (!revokedToken.user) {
      return null
    }
    return revokedToken.user
  }
}
