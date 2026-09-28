import React, { useState } from 'react'
import {
  Alert,
  Badge,
  Button,
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
import { SubscriptionStatus, UserRole } from '@whosonsite/shared'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../app/theme/ThemeContext'
import { PageHeader } from '../components/common/PageHeader'
import { ApiErrorAlert } from '../components/feedback/ApiErrorAlert'
import { ConfirmDialog } from '../components/feedback'
import { useAuth } from '../components/auth/AuthContext'
import { cancelSubscriptionApi } from '../components/auth/api'
import { useUsers } from '../components/people/queries'

export const Subscription: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { primaryColor } = useAppTheme()
  const { user, subscription, refreshSubscription } = useAuth()
  const { data: users = [] } = useUsers()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelError, setCancelError] = useState<Error | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const isOwner = user?.role === UserRole.OWNER
  const status = subscription?.status
  const requiresCheckout = Boolean(subscription?.requiresCheckout)

  const statusBadge = (() => {
    if (!status) return null
    if (status === SubscriptionStatus.ACTIVE) {
      return (
        <Badge color="green" size="md">
          {t('billing.activeBadge', 'ACTIVE')}
        </Badge>
      )
    }
    if (status === SubscriptionStatus.PAST_DUE) {
      return (
        <Badge color="red" size="md">
          {t('billing.pastDueBadge', 'PAST DUE')}
        </Badge>
      )
    }
    if (status === SubscriptionStatus.CANCELLED) {
      return (
        <Badge color="gray" size="md">
          {t('billing.cancelledBadge', 'CANCELLED')}
        </Badge>
      )
    }
    if (status === SubscriptionStatus.EXPIRED || requiresCheckout) {
      return (
        <Badge color="red" size="md">
          {t('billing.expiredBadge', 'EXPIRED')}
        </Badge>
      )
    }
    return (
      <Badge color="blue" size="md">
        {t('billing.trialBadge', 'TRIAL')}
      </Badge>
    )
  })()

  const handleCancel = async () => {
    setIsCancelling(true)
    setCancelError(null)
    try {
      const updated = await cancelSubscriptionApi()
      refreshSubscription()
      if (updated.requiresCheckout) {
        navigate('/checkout', { replace: true })
      }
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsCancelling(false)
      setCancelModalOpen(false)
    }
  }

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

        {requiresCheckout && (
          <Alert
            icon={<Info size={16} />}
            title={t('billing.trialEnded', 'Your 14-day trial has ended')}
            color="red"
            variant="light"
          >
            <Group justify="space-between" align="center" mt={4}>
              <Text size="sm">
                {t(
                  'billing.reinstateHint',
                  'Sandbox payment integration is active. Real payment capture via Razorpay is planned.'
                )}
              </Text>
              <Button size="xs" color={primaryColor} onClick={() => navigate('/checkout')}>
                {t('billing.renewNow', 'Renew Subscription')}
              </Button>
            </Group>
          </Alert>
        )}

        <Grid gutter="sm">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card radius="md" withBorder p="lg">
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <div>
                    {statusBadge}
                    <Title order={3} mt={4}>
                      {t('billing.planName', 'WhosOnSite Professional')}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {t('billing.planDesc', 'Complete real-time dispatch and field operations suite')}
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
                        {t('billing.statusTitle', 'Subscription Status')}
                      </Text>
                      <Text size="lg" fw={700} c={primaryColor}>
                        {status === SubscriptionStatus.ACTIVE
                          ? t('billing.subscribedStatus', 'Active')
                          : status === SubscriptionStatus.TRIAL && subscription && !requiresCheckout
                            ? t('billing.trialRemaining', '{days} days remaining in your trial', {
                                days: subscription.daysRemaining
                              })
                            : status === SubscriptionStatus.TRIAL ||
                                status === SubscriptionStatus.EXPIRED
                              ? t('billing.trialEnded', 'Your 14-day trial has ended')
                              : t('billing.cancelledBadge', 'CANCELLED')}
                      </Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Paper p="sm" radius="md" withBorder bg="var(--mantine-color-body)">
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        {t('billing.assignedSeats', 'Assigned Team Seats')}
                      </Text>
                      <Text size="lg" fw={700} c={primaryColor}>
                        {t('billing.activeUnlimited', '{count} Active / Unlimited', {
                          count: users.length
                        })}
                      </Text>
                    </Paper>
                  </Grid.Col>
                </Grid>

                <Divider my="xs" />

                <Text size="sm" fw={600}>
                  {t('billing.includedFeatures', 'Included Features')}
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
                          {t('billing.paymentMethodDesc', 'Manage your billing details and provider')}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {t(
                            'billing.reinstateHint',
                            'Sandbox payment integration is active. Real payment capture via Razorpay is planned.'
                          )}
                        </Text>
                      </div>
                    </Group>
                    <Badge color="blue" variant="light">
                      Sandbox
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
                    Data isolation enforced cryptographically via JWT tenant context and PostgreSQL row
                    filters.
                  </Text>
                </Paper>

                {cancelError && <ApiErrorAlert error={cancelError} />}

                {isOwner && status === SubscriptionStatus.ACTIVE && (
                  <>
                    <Divider my="xs" />
                    <Button
                      variant="light"
                      color="red"
                      fullWidth
                      loading={isCancelling}
                      onClick={() => setCancelModalOpen(true)}
                    >
                      {t('billing.cancelSubscription', 'Cancel Subscription')}
                    </Button>
                  </>
                )}

                {isOwner && requiresCheckout && (
                  <Button
                    fullWidth
                    color={primaryColor}
                    onClick={() => navigate('/checkout')}
                  >
                    {t('billing.renewNow', 'Renew Subscription')}
                  </Button>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <ConfirmDialog
          opened={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={handleCancel}
          title={t('billing.cancelSubscription', 'Cancel Subscription')}
          message={t(
            'billing.cancelConfirm',
            'Are you sure you want to cancel your subscription? Access will be locked until you subscribe again.'
          )}
          confirmLabel={t('billing.cancelSubscription', 'Cancel Subscription')}
          cancelLabel={t('billing.cancelStays', 'Cancel')}
          isLoading={isCancelling}
        />
      </Stack>
    </Container>
  )
}

export default Subscription