import { Prisma } from '@prisma/client'

export class User implements Prisma.userUncheckedCreateInput {
  id: string
  email: string
  password: string
  name: string
}
