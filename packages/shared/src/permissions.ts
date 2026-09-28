import { UserRole } from './enums/index'

export enum Permission {
  // Jobs
  JOBS_VIEW_ALL = 'jobs:view-all',
  JOBS_VIEW_OWN = 'jobs:view-own',
  JOBS_CREATE = 'jobs:create',
  JOBS_UPDATE = 'jobs:update',
  JOBS_DELETE = 'jobs:delete',
  JOBS_ASSIGN = 'jobs:assign',
  JOBS_STATUS_UPDATE = 'jobs:status-update',
  JOBS_HISTORY_VIEW = 'jobs:history-view',

  // Agents
  AGENTS_VIEW = 'agents:view',
  AGENTS_CREATE = 'agents:create',
  AGENTS_UPDATE = 'agents:update',
  AGENTS_DELETE = 'agents:delete',

  // Customers
  CUSTOMERS_VIEW = 'customers:view',
  CUSTOMERS_CREATE = 'customers:create',
  CUSTOMERS_UPDATE = 'customers:update',
  CUSTOMERS_DELETE = 'customers:delete',

  // Analytics
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_VIEW_PERSONAL = 'analytics:view-personal',

  // Route Plans
  ROUTE_PLANS_VIEW_OWN = 'route-plans:view-own',

  // People / Users
  USERS_VIEW = 'users:view',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DEACTIVATE = 'users:deactivate',

  // Company Settings
  COMPANY_VIEW = 'company:view',
  COMPANY_UPDATE = 'company:update',

  // Billing
  BILLING_VIEW = 'billing:view',
  BILLING_MANAGE = 'billing:manage'
}

/**
 * Static Role to Permission mapping enforcing RBAC boundaries across all workspace tiers.
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  [UserRole.OWNER]: [
    Permission.JOBS_VIEW_ALL,
    Permission.JOBS_CREATE,
    Permission.JOBS_UPDATE,
    Permission.JOBS_DELETE,
    Permission.JOBS_ASSIGN,
    Permission.JOBS_STATUS_UPDATE,
    Permission.JOBS_HISTORY_VIEW,
    Permission.AGENTS_VIEW,
    Permission.AGENTS_CREATE,
    Permission.AGENTS_UPDATE,
    Permission.AGENTS_DELETE,
    Permission.CUSTOMERS_VIEW,
    Permission.CUSTOMERS_CREATE,
    Permission.CUSTOMERS_UPDATE,
    Permission.CUSTOMERS_DELETE,
    Permission.ANALYTICS_VIEW,
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_UPDATE,
    Permission.USERS_DEACTIVATE,
    Permission.COMPANY_VIEW,
    Permission.COMPANY_UPDATE,
    Permission.BILLING_VIEW,
    Permission.BILLING_MANAGE
  ],

  [UserRole.ADMIN]: [
    Permission.JOBS_VIEW_ALL,
    Permission.JOBS_CREATE,
    Permission.JOBS_UPDATE,
    Permission.JOBS_DELETE,
    Permission.JOBS_ASSIGN,
    Permission.JOBS_STATUS_UPDATE,
    Permission.JOBS_HISTORY_VIEW,
    Permission.AGENTS_VIEW,
    Permission.AGENTS_CREATE,
    Permission.AGENTS_UPDATE,
    Permission.AGENTS_DELETE,
    Permission.CUSTOMERS_VIEW,
    Permission.CUSTOMERS_CREATE,
    Permission.CUSTOMERS_UPDATE,
    Permission.CUSTOMERS_DELETE,
    Permission.ANALYTICS_VIEW,
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_UPDATE,
    Permission.USERS_DEACTIVATE
  ],

  [UserRole.STAFF]: [
    Permission.JOBS_VIEW_ALL,
    Permission.AGENTS_VIEW,
    Permission.CUSTOMERS_VIEW,
    Permission.CUSTOMERS_CREATE,
    Permission.CUSTOMERS_UPDATE,
    Permission.CUSTOMERS_DELETE
  ],

  [UserRole.AGENT]: [
    Permission.JOBS_VIEW_OWN,
    Permission.JOBS_STATUS_UPDATE,
    Permission.JOBS_HISTORY_VIEW,
    Permission.ANALYTICS_VIEW_PERSONAL,
    Permission.ROUTE_PLANS_VIEW_OWN
  ]
}

/**
 * Checks if a specific role possesses a target permission.
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) {
    return false
  }
  return permissions.includes(permission)
}

/**
 * Checks if a specific role possesses at least one of the target permissions.
 */
export function roleHasAnyPermission(role: UserRole, permissions: readonly Permission[]): boolean {
  const rolePerms = ROLE_PERMISSIONS[role]
  if (!rolePerms) {
    return false
  }
  return permissions.some((perm) => rolePerms.includes(perm))
}
