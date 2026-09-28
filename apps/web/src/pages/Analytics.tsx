import React from 'react'
import { Container, Grid, Stack } from '@mantine/core'
import { UserRole } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../components/auth/AuthContext'
import { PageHeader } from '../components/common/PageHeader'
import {
  ANALYTICS_WIDGET_REGISTRY,
  ANALYTICS_WIDGETS_BY_ROLE
} from '../components/analytics/registry'

export const Analytics: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const userRole = user?.role || UserRole.OWNER

  const widgetIds = ANALYTICS_WIDGETS_BY_ROLE[userRole] || ANALYTICS_WIDGETS_BY_ROLE[UserRole.OWNER]

  return (
    <Container fluid p={0}>
      <Stack gap="sm">
        <PageHeader
          title={t('analytics.title', 'Operations Analytics')}
          subtitle={t(
            'analytics.subtitle',
            'Real-time company metrics, job status breakdown, completion performance, and agent tracking'
          )}
        />

        <Grid gutter="sm">
          {widgetIds.map((id) => {
            const descriptor = ANALYTICS_WIDGET_REGISTRY[id]
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

export default Analytics
