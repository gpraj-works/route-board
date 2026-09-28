import React from 'react'
import { Container, Grid, Stack } from '@mantine/core'
import { UserRole } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../components/auth/AuthContext'
import { PageHeader } from '../components/common/PageHeader'
import {
  DASHBOARD_WIDGET_REGISTRY,
  DASHBOARD_WIDGETS_BY_ROLE
} from '../components/dashboard/registry'

export const Dashboard: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const userRole = user?.role || UserRole.OWNER

  const widgetIds = DASHBOARD_WIDGETS_BY_ROLE[userRole] || DASHBOARD_WIDGETS_BY_ROLE[UserRole.OWNER]

  const getSubtitle = () => {
    switch (userRole) {
      case UserRole.AGENT:
        return t('dashboard.agentSubtitle', 'Your job schedule and performance at a glance')
      case UserRole.STAFF:
        return t(
          'dashboard.staffSubtitle',
          'Customer service, dispatch overview, and technician status'
        )
      case UserRole.ADMIN:
      case UserRole.OWNER:
      default:
        return t(
          'dashboard.managementSubtitle',
          'Company-wide dispatch and field operations overview'
        )
    }
  }

  return (
    <Container fluid p={0}>
      <Stack gap="xs">
        <PageHeader
          title={
            userRole === UserRole.AGENT
              ? t('dashboard.myDashboardTitle', 'My Dashboard')
              : userRole === UserRole.STAFF
                ? t('dashboard.staffDashboardTitle', 'Operations Dashboard')
                : t('dashboard.title', 'Dashboard')
          }
          subtitle={getSubtitle()}
        />

        <Grid gutter="sm">
          {widgetIds.map((id) => {
            const descriptor = DASHBOARD_WIDGET_REGISTRY[id]
            if (!descriptor) return null
            const Component = descriptor.component
            return (
              <Grid.Col key={id} span={descriptor.span}>
                <Component />
              </Grid.Col>
            )
          })}
        </Grid>
      </Stack>
    </Container>
  )
}

export default Dashboard
