import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { addHours } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

import { Pagination } from '../../../infrastructure/common/pagination/pagination.service'
import { PrismaService } from '../../../prisma.service'
import {
  CreateUserInput,
  EntityWithPaginationType,
  User,
  UserViewType,
  VerificationWithUser,
} from '../../../types/types'

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(UsersRepository.name)

  async getUsers(
    currentPage: number,
    itemsPerPage: number,
    searchNameTerm: string,
    searchEmailTerm: string
  ): Promise<EntityWithPaginationType<UserViewType>> {
    try {
      const where: Prisma.userWhereInput = {
        name: {
          contains: searchNameTerm || undefined,
        },
        email: {
          contains: searchEmailTerm || undefined,
        },
      }
      const res = await this.prisma.$transaction([
        this.prisma.user.count({ where }),
        this.prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            isEmailVerified: true,
          },
          skip: (currentPage - 1) * itemsPerPage,
          take: itemsPerPage,
        }),
      ])

      return Pagination.transformPaginationData(res, { currentPage, itemsPerPage })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new BadRequestException({ message: 'Invalid page number', field: 'page' })
        }
      }
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }

  async createUser(newUser: CreateUserInput): Promise<User | null> {
    try {
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
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestException({ message: 'Email already exists', field: 'email' })
        }
      }
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }

  async deleteUserById(id: string): Promise<boolean> {
    try {
      const result = await this.prisma.user.delete({
        where: {
          id,
        },
      })

      return result.isDeleted
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2015') {
          throw new BadRequestException({ message: 'User not found', field: 'id' })
        }
      }
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }

  async deleteAllUsers(): Promise<number> {
    try {
      const result = await this.prisma.user.deleteMany()

      return result.count
    } catch (e) {
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }

  async findUserById(id: string, include?: Prisma.userInclude) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include,
      })

      if (!user) {
        return null
      }

      return user as Prisma.userGetPayload<{ include: typeof include }>
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2015') {
          throw new BadRequestException({ message: 'User not found', field: 'id' })
        }
      }
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { verification: true },
      })

      if (!user) {
        return null
      }

      return user
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2015') {
          throw new BadRequestException({ message: 'User not found', field: 'email' })
        }
      }
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }

  async findUserByVerificationToken(token: string): Promise<VerificationWithUser | null> {
    try {
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
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2015') {
          throw new BadRequestException({ message: 'Verification not found', field: 'token' })
        }
      }
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }

  async updateEmailVerification(id: string) {
    try {
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
    } catch (e) {
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }

  async updateVerificationToken(id: string) {
    try {
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
    } catch (e) {
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }

  async createPasswordResetToken(id: string, token: string) {
    try {
      return await this.prisma.resetPassword.upsert({
        where: {
          userId: id,
        },
        update: {
          resetPasswordToken: token,
          resetPasswordTokenExpiry: addHours(new Date(), 1),
          resetPasswordEmailsSent: {
            increment: 1,
          },
        },
        create: {
          resetPasswordToken: token,
          resetPasswordTokenExpiry: addHours(new Date(), 1),
          resetPasswordEmailsSent: 1,
          user: {
            connect: {
              id,
            },
          },
        },
        include: {
          user: true,
        },
      })
    } catch (e) {
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }

  async findUserByPasswordResetToken(token: string): Promise<User | null> {
    try {
      const resetPassword = await this.prisma.resetPassword.findUnique({
        where: {
          resetPasswordToken: token,
        },
        include: {
          user: true,
        },
      })

      if (!resetPassword) {
        return null
      }

      return resetPassword.user
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2015') {
          throw new BadRequestException({ message: 'Invalid token', field: 'token' })
        }
      }
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }

  async resetPasswordAndDeleteToken(userId: string, password: string) {
    try {
      return await this.prisma.$transaction([
        this.prisma.resetPassword.update({
          where: {
            userId: userId,
          },
          data: {
            resetPasswordToken: null,
            resetPasswordTokenExpiry: null,
            resetPasswordEmailsSent: {
              increment: 1,
            },
          },
          include: {
            user: true,
          },
        }),
        this.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            password,
          },
        }),
      ])
    } catch (e) {
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }

  async revokeToken(id: string, token: string): Promise<User | null> {
    try {
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
    } catch (e) {
      this.logger.error(e?.message || e)
      throw new InternalServerErrorException(e)
    }
  }
}
