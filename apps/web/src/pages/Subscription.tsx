import React from 'react'
import {
  Alert,
  Badge,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  List,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title
} from '@mantine/core'
import { Check, CreditCard, Info, ShieldCheck, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../app/theme/ThemeContext'
import { PageHeader } from '../components/common/PageHeader'
import { useUsers } from '../components/people/queries'

export const Subscription: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: users = [] } = useUsers()

  return (
    <Container fluid p={0}>
      <Stack gap="xs">
        <PageHeader
          title={t('billing.title', 'Subscription & Billing')}
          subtitle={t(
            'billing.subtitle',
            'Company plan tier, dispatch seat allocations, and invoicing details'
          )}
        />

        <Alert
          icon={<Info size={16} />}
          title={t('billing.roadmapNoticeTitle', 'Billing Management Preview')}
          color="blue"
          variant="light"
        >
          {t(
            'billing.roadmapNotice',
            'Stripe payment gateway integration is scheduled for Phase 11 (see docs/tmp-billing.md). Your company is currently running on the complimentary Professional Plan.'
          )}
        </Alert>

        <Grid gutter="sm">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card radius="md" withBorder p="lg">
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Badge color="green" size="md" mb={4}>
                      {t('billing.activePlan', 'ACTIVE PLAN')}
                    </Badge>
                    <Title order={3}>WhosOnSite Professional</Title>
                    <Text size="sm" c="dimmed">
                      Complete real-time dispatch and field operations suite
                    </Text>
                  </div>
                  <ThemeIcon size={48} radius="md" color={primaryColor} variant="light">
                    <Sparkles size={24} />
                  </ThemeIcon>
                </Group>

                <Divider my="xs" />

                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <Paper p="sm" radius="md" withBorder bg="var(--mantine-color-body)">
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        Billing Frequency
                      </Text>
                      <Text size="lg" fw={700}>
                        Monthly
                      </Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Paper p="sm" radius="md" withBorder bg="var(--mantine-color-body)">
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        Assigned Team Seats
                      </Text>
                      <Text size="lg" fw={700} c={primaryColor}>
                        {users.length} Active / Unlimited
                      </Text>
                    </Paper>
                  </Grid.Col>
                </Grid>

                <Divider my="xs" />

                <Text size="sm" fw={600}>
                  Included Features:
                </Text>
                <List
                  spacing="xs"
                  size="sm"
                  center
                  icon={
                    <ThemeIcon color="green" size={20} radius="xl">
                      <Check size={12} />
                    </ThemeIcon>
                  }
                >
                  <List.Item>
                    Real-time interactive dispatch board & technician geotracking
                  </List.Item>
                  <List.Item>Live customer tracking links with route animations</List.Item>
                  <List.Item>
                    4-tier role-based access control (Owner, Admin, Staff, Agent)
                  </List.Item>
                  <List.Item>Agent Route Plans with chronological stop execution</List.Item>
                  <List.Item>
                    Company operations analytics, performance benchmarks, and notifications
                  </List.Item>
                </List>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card radius="md" withBorder p="lg">
              <Stack gap="md">
                <Group gap="xs">
                  <CreditCard
                    size={20}
                    style={{ color: `var(--mantine-color-${primaryColor}-6)` }}
                  />
                  <Title order={4}>{t('billing.paymentMethod', 'Payment Method')}</Title>
                </Group>

                <Paper p="md" radius="md" withBorder bg="var(--mantine-color-default-hover)">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon size={36} radius="md" color="gray" variant="light">
                        <CreditCard size={18} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={600}>
                          Complimentary Sandbox License
                        </Text>
                        <Text size="xs" c="dimmed">
                          Zero billing friction during workspace testing
                        </Text>
                      </div>
                    </Group>
                    <Badge color="blue" variant="light">
                      Free Tier
                    </Badge>
                  </Group>
                </Paper>

                <Paper p="sm" radius="md" withBorder>
                  <Group gap="xs">
                    <ShieldCheck size={18} style={{ color: 'green' }} />
                    <Text size="xs" fw={600}>
                      Multi-Company Tenant Isolation Guaranteed
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed" mt={4}>
                    Data isolation enforced cryptographically via JWT tenant context and PostgreSQL
                    row filters.
                  </Text>
                </Paper>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}

export default Subscription
