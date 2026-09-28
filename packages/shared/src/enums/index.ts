export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  STAFF = 'staff',
  AGENT = 'agent'
}

export enum UserStatus {
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated'
}

export enum AgentStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline'
}

export enum JobStatus {
  UNASSIGNED = 'unassigned',
  ASSIGNED = 'assigned',
  EN_ROUTE = 'en_route',
  ON_SITE = 'on_site',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled'
}

export const SubscriptionStatus = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
} as const

export type SubscriptionStatusKey = keyof typeof SubscriptionStatus
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus]

export const THEME_COLORS = ['teal', 'indigo', 'blue', 'violet', 'orange', 'green'] as const
