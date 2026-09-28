import { dayjs, SubscriptionInfo, SubscriptionStatus } from '@whosonsite/shared'
import { NotFoundError } from '../../common/app-error'
import * as subscriptionRepo from './subscription.repository'
import { CheckoutSessionDto, CompanySubscriptionRow } from './subscription.types'

export const PROFESSIONAL_PLAN = 'professional'
export const TRIAL_DAYS = 14

/**
 * Computes the live subscription snapshot for a company row.
 * Shared between the auth login/refresh path and the subscription endpoints.
 */
export function computeSubscriptionInfo(company: CompanySubscriptionRow): SubscriptionInfo {
  const now = dayjs()
  const status = company.subscriptionStatus as SubscriptionStatus
  const trialEndsAt = company.trialEndsAt ? dayjs(company.trialEndsAt) : null

  const isTrialExpired =
    status === SubscriptionStatus.TRIAL && (trialEndsAt ? now.isAfter(trialEndsAt) : false)

  const daysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil(trialEndsAt.diff(now, 'day', true)))
    : 0

  const requiresCheckout =
    isTrialExpired ||
    status === SubscriptionStatus.EXPIRED ||
    status === SubscriptionStatus.CANCELLED ||
    status === SubscriptionStatus.PAST_DUE

  return {
    status,
    plan: PROFESSIONAL_PLAN,
    trialStartedAt: company.trialStartedAt ? dayjs(company.trialStartedAt).toISOString() : null,
    trialEndsAt: company.trialEndsAt ? dayjs(company.trialEndsAt).toISOString() : null,
    daysRemaining,
    isTrialExpired,
    requiresCheckout
  }
}

/**
 * Returns the current subscription status for the authenticated company.
 */
export async function getSubscriptionStatus(companyId: string): Promise<SubscriptionInfo> {
  const company = await subscriptionRepo.findCompanyById(companyId)
  if (!company) {
    throw new NotFoundError('Company not found')
  }
  return computeSubscriptionInfo(company)
}

/**
 * Sandbox checkout: no real payment is charged. Returns the plan metadata
 * that a future Razorpay integration would turn into a payment session.
 */
export async function createSandboxCheckout(companyId: string): Promise<CheckoutSessionDto> {
  const company = await subscriptionRepo.findCompanyById(companyId)
  if (!company) {
    throw new NotFoundError('Company not found')
  }

  return {
    provider: 'sandbox',
    sandbox: true,
    plan: {
      id: PROFESSIONAL_PLAN,
      name: 'Professional',
      amountPerMonth: 0,
      currency: 'USD'
    },
    message: 'Sandbox mode. No payment is captured in this environment.'
  }
}

/**
 * Confirms a sandbox checkout, moving the company from trial to an active subscription.
 */
export async function confirmCheckout(companyId: string): Promise<SubscriptionInfo> {
  const company = await subscriptionRepo.findCompanyById(companyId)
  if (!company) {
    throw new NotFoundError('Company not found')
  }

  const updated = await subscriptionRepo.updateSubscriptionStatus(
    companyId,
    SubscriptionStatus.ACTIVE
  )
  return computeSubscriptionInfo(updated!)
}

/**
 * Cancels the current subscription (sandbox equivalent of PUT /subscription/cancel).
 */
export async function cancelSubscription(companyId: string): Promise<SubscriptionInfo> {
  const company = await subscriptionRepo.findCompanyById(companyId)
  if (!company) {
    throw new NotFoundError('Company not found')
  }

  const updated = await subscriptionRepo.updateSubscriptionStatus(
    companyId,
    SubscriptionStatus.CANCELLED
  )
  return computeSubscriptionInfo(updated!)
}