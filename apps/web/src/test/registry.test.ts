import { describe, expect, it } from 'vitest'
import { UserRole } from '@whosonsite/shared'
import {
  DASHBOARD_WIDGET_REGISTRY,
  DASHBOARD_WIDGETS_BY_ROLE
} from '../components/dashboard/registry'
import {
  ANALYTICS_WIDGET_REGISTRY,
  ANALYTICS_WIDGETS_BY_ROLE
} from '../components/analytics/registry'

describe('Dashboard Widget Registry', () => {
  it('registers all widget descriptors with valid components and span values', () => {
    for (const [id, descriptor] of Object.entries(DASHBOARD_WIDGET_REGISTRY)) {
      expect(descriptor.id).toBe(id)
      expect(descriptor.component).toBeDefined()
      expect(descriptor.span.base).toBeGreaterThan(0)
    }
  })

  it('assigns role-appropriate widgets for OWNER including billing overview', () => {
    const ownerWidgets = DASHBOARD_WIDGETS_BY_ROLE[UserRole.OWNER]
    expect(ownerWidgets).toContain('billingOverview')
    expect(ownerWidgets).toContain('teamSnapshot')
    expect(ownerWidgets).toContain('customersSnapshot')
    expect(ownerWidgets).toContain('recentJobsTable')
    expect(ownerWidgets).not.toContain('myJobsToday')
  })

  it('excludes billingOverview from ADMIN dashboard', () => {
    const adminWidgets = DASHBOARD_WIDGETS_BY_ROLE[UserRole.ADMIN]
    expect(adminWidgets).toContain('teamSnapshot')
    expect(adminWidgets).toContain('customersSnapshot')
    expect(adminWidgets).not.toContain('billingOverview')
    expect(adminWidgets).not.toContain('myJobsToday')
  })

  it('restricts STAFF to operational snapshot widgets without team or billing management', () => {
    const staffWidgets = DASHBOARD_WIDGETS_BY_ROLE[UserRole.STAFF]
    expect(staffWidgets).toContain('customersSnapshot')
    expect(staffWidgets).toContain('recentJobsTable')
    expect(staffWidgets).toContain('fieldAgents')
    expect(staffWidgets).toContain('dispatchCompletion')
    expect(staffWidgets).not.toContain('teamSnapshot')
    expect(staffWidgets).not.toContain('billingOverview')
    expect(staffWidgets).not.toContain('myJobsToday')
  })

  it('provides personal execution schedule and metrics to AGENT role', () => {
    const agentWidgets = DASHBOARD_WIDGETS_BY_ROLE[UserRole.AGENT]
    expect(agentWidgets).toContain('myJobsToday')
    expect(agentWidgets).toContain('nextAppointment')
    expect(agentWidgets).toContain('completionRate')
    expect(agentWidgets).toContain('todaySchedule')
    expect(agentWidgets).toContain('myPerformance')
    expect(agentWidgets).not.toContain('billingOverview')
    expect(agentWidgets).not.toContain('teamSnapshot')
  })

  it('ensures every widget ID assigned to any role is registered in DASHBOARD_WIDGET_REGISTRY', () => {
    for (const role of Object.values(UserRole)) {
      const widgetIds = DASHBOARD_WIDGETS_BY_ROLE[role]
      for (const id of widgetIds) {
        expect(DASHBOARD_WIDGET_REGISTRY[id]).toBeDefined()
      }
    }
  })
})

describe('Analytics Widget Registry', () => {
  it('registers all analytics descriptors with valid components and span values', () => {
    for (const [id, descriptor] of Object.entries(ANALYTICS_WIDGET_REGISTRY)) {
      expect(descriptor.id).toBe(id)
      expect(descriptor.component).toBeDefined()
      expect(descriptor.span.base).toBeGreaterThan(0)
    }
  })

  it('includes billingOverview for OWNER analytics and excludes for ADMIN', () => {
    const ownerWidgets = ANALYTICS_WIDGETS_BY_ROLE[UserRole.OWNER]
    const adminWidgets = ANALYTICS_WIDGETS_BY_ROLE[UserRole.ADMIN]

    expect(ownerWidgets).toContain('billingOverview')
    expect(ownerWidgets).toContain('topAgentsTable')
    expect(adminWidgets).not.toContain('billingOverview')
    expect(adminWidgets).toContain('topAgentsTable')
  })

  it('has empty analytics widget lists for STAFF and AGENT who lack company-wide analytics permission', () => {
    expect(ANALYTICS_WIDGETS_BY_ROLE[UserRole.STAFF]).toHaveLength(0)
    expect(ANALYTICS_WIDGETS_BY_ROLE[UserRole.AGENT]).toHaveLength(0)
  })

  it('ensures every widget ID assigned to any role is registered in ANALYTICS_WIDGET_REGISTRY', () => {
    for (const role of Object.values(UserRole)) {
      const widgetIds = ANALYTICS_WIDGETS_BY_ROLE[role]
      for (const id of widgetIds) {
        expect(ANALYTICS_WIDGET_REGISTRY[id]).toBeDefined()
      }
    }
  })
})
