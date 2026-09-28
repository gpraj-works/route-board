import { SubscriptionStatus } from '@whosonsite/shared'

export interface CompanySubscriptionRow {
  id: string
  name: string
  trialStartedAt: Date | null
  trialEndsAt: Date | null
  subscriptionStatus: SubscriptionStatus
  paymentCustomerId?: string | null
  paymentSubscriptionId?: string | null
}

export interface CheckoutSessionDto {
  provider: string
  sandbox: boolean
  plan: {
    id: string
    name: string
    amountPerMonth: number
    currency: string
  }
  message?: string
}