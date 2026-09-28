import React from 'react'
import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import { CreditCard, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppTheme } from '../../../app/theme/ThemeContext'

export const BillingOverviewWidget: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()

  return (
    <Card radius="md" withBorder shadow="xs" p="md" style={{ height: '100%' }}>
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <CreditCard size={18} style={{ color: 'var(--mantine-color-teal-6)' }} />
          <Title order={5}>{t('dashboard.billingOverview', 'Subscription')}</Title>
        </Group>
        <Badge color="green" variant="light">
          {t('billing.activeBadge', 'ACTIVE')}
        </Badge>
      </Group>

      <Stack gap="xs" mt="xs">
        <div>
          <Text size="sm" fw={700}>
            WhosOnSite Professional Plan
          </Text>
          <Text size="xs" c="dimmed">
            Multi-tech live dispatch, real-time geotracking, and team analytics
          </Text>
        </div>

        <Group justify="space-between" align="center" mt="xs">
          <Group gap={6}>
            <Sparkles size={14} style={{ color: 'var(--mantine-color-orange-6)' }} />
            <Text size="xs" fw={600} c="dimmed">
              Unlimited field dispatch seats
            </Text>
          </Group>
          <Button
            size="xs"
            variant="light"
            color={primaryColor}
            component={Link}
            to="/subscription"
          >
            {t('billing.managePlan', 'Manage Plan')}
          </Button>
        </Group>
      </Stack>
    </Card>
  )
}
