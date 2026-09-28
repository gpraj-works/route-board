import { eq } from 'drizzle-orm'
import { SubscriptionStatus } from '@whosonsite/shared'
import { DatabaseClient, db } from '../../infrastructure/database/client'
import { companies } from '../../infrastructure/database/schema/index'
import { CompanySubscriptionRow } from './subscription.types'

export async function findCompanyById(
  id: string,
  client: DatabaseClient = db
): Promise<CompanySubscriptionRow | null> {
  const [row] = await client
    .select({
      id: companies.id,
      name: companies.name,
      trialStartedAt: companies.trialStartedAt,
      trialEndsAt: companies.trialEndsAt,
      subscriptionStatus: companies.subscriptionStatus,
      paymentCustomerId: companies.paymentCustomerId,
      paymentSubscriptionId: companies.paymentSubscriptionId
    })
    .from(companies)
    .where(eq(companies.id, id))
  return row || null
}

export async function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
  client: DatabaseClient = db
): Promise<CompanySubscriptionRow | null> {
  const [row] = await client
    .update(companies)
    .set({ subscriptionStatus: status })
    .where(eq(companies.id, id))
    .returning()

  if (!row) return null
  return findCompanyById(id, client)
}