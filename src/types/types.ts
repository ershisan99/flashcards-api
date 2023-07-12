import { Prisma } from '@prisma/client'

export type NewestLikesType = {
  id: string
  login: string
  addedAt: Date
}
export type ExtendedLikesInfoType = {
  dislikesCount: number
  likesCount: number
  myStatus: string
  newestLikes: Array<NewestLikesType>
}
export type PostType = {
  addedAt: Date
  id?: string
  title: string | null
  shortDescription: string | null
  content: string | null
  blogId: string
  blogName?: string | null
  extendedLikesInfo: ExtendedLikesInfoType
}
export type BlogType = {
  id: string
  name: string | null
  youtubeUrl: string | null
}

export type LikeType = {
  userId: string
  login: string
  action: string
  addedAt: Date
}

export type CommentType = {
  id: string
  content: string //20<len<300
  postId: string
  userId: string
  userLogin: string
  addedAt: Date
  likesInfo?: {
    likesCount: number
    dislikesCount: number
    myStatus: string
  }
}
export type EntityWithPaginationType<T> = {
  pagination: {
    totalPages: number
    currentPage: number
    itemsPerPage: number
    totalItems: number
  }
  items: T[]
}

export type QueryDataType = {
  page: number
  pageSize: number
  searchNameTerm: string
}
export type ErrorMessageType = {
  message: string
  field: string
}

const userInclude: Prisma.userInclude = {
  verification: true,
}

export type VerificationWithUser = Prisma.verificationGetPayload<{
  include: { user: true }
}>

export type User = Prisma.userGetPayload<{
  include: typeof userInclude
}>

export type CreateUserInput = Omit<Prisma.userCreateInput & Prisma.verificationCreateInput, 'user'>

export type UserType = {
  accountData: Prisma.userCreateInput
  emailConfirmation: EmailConfirmationType
}

export type UserViewType = {
  id: string
  name: string
  email: string
}

export type UserAccountType = {
  id: string
  email: string
  login: string
  passwordHash: string
  createdAt: Date
  revokedTokens?: string[] | null
}
export type SentConfirmationEmailType = {
  sentDate: Date
}

export type LoginAttemptType = {
  attemptDate: Date
  ip: string
}

export type EmailConfirmationType = {
  isConfirmed: boolean
  confirmationCode: string
  expirationDate: Date
  sentEmails?: SentConfirmationEmailType[]
}

export type LimitsControlType = {
  userIp: string
  url: string
  time: Date
}
export type CheckLimitsType = {
  login: string | null
  userIp: string
  url: string
  time: Date
}

export type EmailConfirmationMessageType = {
  email: string
  message: string
  subject: string
  isSent: boolean
  createdAt: Date
}

export enum LikeAction {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export type LikeActionType = 'Like' | 'Dislike' | 'None'
