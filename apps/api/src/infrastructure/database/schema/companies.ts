import { doublePrecision, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trial',
  'active',
  'past_due',
  'cancelled',
  'expired'
])

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country').notNull().default('US'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  primaryColor: text('primary_color').default('teal').notNull(),
  trialStartedAt: timestamp('trial_started_at', { withTimezone: true }),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').default('trial').notNull(),
  paymentCustomerId: text('payment_customer_id'),
  paymentSubscriptionId: text('payment_subscription_id'),
  ...timestamps()
})

