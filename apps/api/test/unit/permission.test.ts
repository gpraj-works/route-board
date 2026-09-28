import { describe, expect, it } from 'vitest'
import { Permission, roleHasAnyPermission, roleHasPermission, UserRole } from '@whosonsite/shared'

describe('RBAC Permission Matrix Unit Tests', () => {
  it('verifies OWNER has all management, company, and billing permissions', () => {
    expect(roleHasPermission(UserRole.OWNER, Permission.JOBS_CREATE)).toBe(true)
    expect(roleHasPermission(UserRole.OWNER, Permission.USERS_VIEW)).toBe(true)
    expect(roleHasPermission(UserRole.OWNER, Permission.COMPANY_UPDATE)).toBe(true)
    expect(roleHasPermission(UserRole.OWNER, Permission.BILLING_MANAGE)).toBe(true)
  })

  it('verifies ADMIN has operational access but is blocked from company and billing', () => {
    expect(roleHasPermission(UserRole.ADMIN, Permission.JOBS_CREATE)).toBe(true)
    expect(roleHasPermission(UserRole.ADMIN, Permission.USERS_CREATE)).toBe(true)
    expect(roleHasPermission(UserRole.ADMIN, Permission.COMPANY_UPDATE)).toBe(false)
    expect(roleHasPermission(UserRole.ADMIN, Permission.BILLING_MANAGE)).toBe(false)
  })

  it('verifies STAFF has Customer CRUD and view-only access to Jobs and Agents', () => {
    expect(roleHasPermission(UserRole.STAFF, Permission.CUSTOMERS_CREATE)).toBe(true)
    expect(roleHasPermission(UserRole.STAFF, Permission.CUSTOMERS_UPDATE)).toBe(true)
    expect(roleHasPermission(UserRole.STAFF, Permission.JOBS_VIEW_ALL)).toBe(true)
    expect(roleHasPermission(UserRole.STAFF, Permission.AGENTS_VIEW)).toBe(true)

    // Blocked permissions
    expect(roleHasPermission(UserRole.STAFF, Permission.JOBS_CREATE)).toBe(false)
    expect(roleHasPermission(UserRole.STAFF, Permission.JOBS_ASSIGN)).toBe(false)
    expect(roleHasPermission(UserRole.STAFF, Permission.AGENTS_CREATE)).toBe(false)
    expect(roleHasPermission(UserRole.STAFF, Permission.ANALYTICS_VIEW)).toBe(false)
    expect(roleHasPermission(UserRole.STAFF, Permission.USERS_VIEW)).toBe(false)
  })

  it('verifies AGENT has personal execution and route plan permissions only', () => {
    expect(roleHasPermission(UserRole.AGENT, Permission.JOBS_VIEW_OWN)).toBe(true)
    expect(roleHasPermission(UserRole.AGENT, Permission.JOBS_STATUS_UPDATE)).toBe(true)
    expect(roleHasPermission(UserRole.AGENT, Permission.ROUTE_PLANS_VIEW_OWN)).toBe(true)
    expect(roleHasPermission(UserRole.AGENT, Permission.ANALYTICS_VIEW_PERSONAL)).toBe(true)

    // Blocked permissions
    expect(roleHasPermission(UserRole.AGENT, Permission.JOBS_VIEW_ALL)).toBe(false)
    expect(roleHasPermission(UserRole.AGENT, Permission.CUSTOMERS_VIEW)).toBe(false)
    expect(roleHasPermission(UserRole.AGENT, Permission.ANALYTICS_VIEW)).toBe(false)
  })

  it('verifies roleHasAnyPermission evaluates disjunctive permission checks correctly', () => {
    expect(
      roleHasAnyPermission(UserRole.STAFF, [Permission.JOBS_CREATE, Permission.JOBS_VIEW_ALL])
    ).toBe(true)

    expect(
      roleHasAnyPermission(UserRole.STAFF, [Permission.JOBS_CREATE, Permission.JOBS_ASSIGN])
    ).toBe(false)
  })
})
