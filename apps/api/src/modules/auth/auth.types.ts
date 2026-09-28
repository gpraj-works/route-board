import { SubscriptionStatus, UserRole } from '@whosonsite/shared'

export interface CreateCompanyData {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string
  latitude?: number | null
  longitude?: number | null
  trialStartedAt?: Date | null
  trialEndsAt?: Date | null
  subscriptionStatus?: SubscriptionStatus
}

export interface CreateUserData {
  companyId: string
  email: string
  passwordHash: string
  role: UserRole
}

export interface CreateRefreshTokenData {
  companyId: string
  userId: string
  tokenHash: string
  expiresAt: Date
}
