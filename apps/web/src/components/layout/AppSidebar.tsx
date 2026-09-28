import React from 'react'
import { NavLink, Stack } from '@mantine/core'
import { Permission } from '@whosonsite/shared'
import {
  BarChart3,
  Briefcase,
  CreditCard,
  LayoutDashboard,
  Navigation,
  ShieldCheck,
  UserCheck,
  Users
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useCan } from '../auth/RequirePermission'

interface AppSidebarProps {
  onNavigate?: () => void
}

interface NavItemConfig {
  icon: React.ComponentType<{ size?: number }>
  label: string
  path: string
  permission?: Permission
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ onNavigate }) => {
  const { t } = useTranslation()
  const location = useLocation()

  const canJobsViewAll = useCan(Permission.JOBS_VIEW_ALL)
  const canJobsViewOwn = useCan(Permission.JOBS_VIEW_OWN)
  const canRoutePlansViewOwn = useCan(Permission.ROUTE_PLANS_VIEW_OWN)
  const canAgentsView = useCan(Permission.AGENTS_VIEW)
  const canCustomersView = useCan(Permission.CUSTOMERS_VIEW)
  const canAnalyticsView = useCan(Permission.ANALYTICS_VIEW)
  const canUsersView = useCan(Permission.USERS_VIEW)
  const canBillingView = useCan(Permission.BILLING_VIEW)

  const navItems: NavItemConfig[] = [
    {
      icon: LayoutDashboard,
      label: t('nav.dashboard', 'Dashboard'),
      path: '/dashboard'
    },
    ...(canJobsViewAll
      ? [
          {
            icon: Briefcase,
            label: t('nav.jobs', 'Jobs'),
            path: '/jobs',
            permission: Permission.JOBS_VIEW_ALL
          }
        ]
      : []),
    ...(canJobsViewOwn
      ? [
          {
            icon: Briefcase,
            label: t('nav.myJobs', 'My Jobs'),
            path: '/my-jobs',
            permission: Permission.JOBS_VIEW_OWN
          }
        ]
      : []),
    ...(canRoutePlansViewOwn
      ? [
          {
            icon: Navigation,
            label: t('nav.routePlans', 'Route Plans'),
            path: '/route-plans',
            permission: Permission.ROUTE_PLANS_VIEW_OWN
          }
        ]
      : []),
    ...(canAgentsView
      ? [
          {
            icon: Users,
            label: t('nav.agents', 'Agents'),
            path: '/agents',
            permission: Permission.AGENTS_VIEW
          }
        ]
      : []),
    ...(canCustomersView
      ? [
          {
            icon: UserCheck,
            label: t('nav.customers', 'Customers'),
            path: '/customers',
            permission: Permission.CUSTOMERS_VIEW
          }
        ]
      : []),
    ...(canAnalyticsView
      ? [
          {
            icon: BarChart3,
            label: t('nav.analytics', 'Analytics'),
            path: '/analytics',
            permission: Permission.ANALYTICS_VIEW
          }
        ]
      : []),
    ...(canUsersView
      ? [
          {
            icon: ShieldCheck,
            label: t('nav.people', 'People'),
            path: '/people',
            permission: Permission.USERS_VIEW
          }
        ]
      : []),
    ...(canBillingView
      ? [
          {
            icon: CreditCard,
            label: t('nav.subscription', 'Subscription'),
            path: '/subscription',
            permission: Permission.BILLING_VIEW
          }
        ]
      : [])
  ]

  return (
    <Stack gap="xs" p="xs">
      {navItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path === '/dashboard' && location.pathname === '/')
        return (
          <NavLink
            key={item.path}
            component={Link}
            to={item.path}
            label={item.label}
            leftSection={<item.icon size={18} />}
            active={isActive}
            onClick={onNavigate}
            variant="light"
            style={{ borderRadius: 'var(--mantine-radius-md)' }}
          />
        )
      })}
    </Stack>
  )
}
