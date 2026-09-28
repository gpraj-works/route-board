import React, { useEffect, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title
} from '@mantine/core'
import { CreditCard, Info, ShieldCheck, Sparkles } from 'lucide-react'
import { UserRole } from '@whosonsite/shared'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../app/theme/ThemeContext'
import { PageHeader } from '../components/common/PageHeader'
import { ApiErrorAlert } from '../components/feedback/ApiErrorAlert'
import { useAuth } from '../components/auth/AuthContext'
import { createCheckoutApi, confirmCheckoutApi, CheckoutSession } from '../components/auth/api'

export const Checkout: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { primaryColor } = useAppTheme()
  const { user, refreshSubscription } = useAuth()
  const [session, setSession] = useState<CheckoutSession | null>(null)
  const [sessionError, setSessionError] = useState<Error | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<Error | null>(null)

  const isOwner = user?.role === UserRole.OWNER

  useEffect(() => {
    if (!isOwner) {
      return
    }
    createCheckoutApi()
      .then(setSession)
      .catch((err: unknown) => setSessionError(err instanceof Error ? err : new Error(String(err))))
  }, [isOwner])

  const handleConfirm = async () => {
    setIsConfirming(true)
    setConfirmError(null)
    try {
      await confirmCheckoutApi()
      refreshSubscription()
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setConfirmError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Container fluid p={0}>
      <Stack gap="xs">
        <PageHeader
          title={t('billing.checkOutTitle', 'Checkout')}
          subtitle={t('billing.checkOutSubtitle', 'Confirm your Professional plan subscription')}
        />

        <Alert icon={<Info size={16} />} color="blue" variant="light">
          {t('billing.sandboxNotice', 'Sandbox checkout — no payment is captured in this environment.')}
        </Alert>

        {isOwner ? (
          <Grid gutter="sm">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Card radius="md" withBorder p="lg">
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Badge color="green" size="md" mb={4}>
                        {t('billing.activePlan', 'ACTIVE PLAN')}
                      </Badge>
                      <Title order={3}>{t('billing.planName', 'WhosOnSite Professional')}</Title>
                      <Text size="sm" c="dimmed">
                        {t('billing.planDesc', 'Complete real-time dispatch and field operations suite')}
                      </Text>
                    </div>
                    <ThemeIcon size={48} radius="md" color={primaryColor} variant="light">
                      <Sparkles size={24} />
                    </ThemeIcon>
                  </Group>

                  <Divider my="xs" />

                  <Text size="sm" fw={600}>
                    {t('billing.orderSummary', 'Order Summary')}
                  </Text>
                  <Paper p="sm" radius="md" withBorder bg="var(--mantine-color-body)">
                    <Group justify="space-between">
                      <Group gap="sm">
                        <ThemeIcon size={32} radius="md" color={primaryColor} variant="light">
                          <CreditCard size={16} />
                        </ThemeIcon>
                        <div>
                          <Text size="sm" fw={600}>
                            {t('billing.planName', 'WhosOnSite Professional')}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {t('billing.seatLabel', 'Company subscription')}
                          </Text>
                        </div>
                      </Group>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">
                          {t('billing.quantity', 'Qty')} 1
                        </Text>
                        <Text size="sm" fw={700}>
                          {session ? `$${(session.plan.amountPerMonth ?? 0).toFixed(2)}` : '$0.00'}
                          /mo
                        </Text>
                      </Group>
                    </Group>
                  </Paper>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Card radius="md" withBorder p="lg">
                <Stack gap="md">
                  <Title order={4}>{t('billing.paymentMethod', 'Payment Method')}</Title>

                  <Paper p="md" radius="md" withBorder bg="var(--mantine-color-default-hover)">
                    <Group justify="space-between">
                      <Group gap="sm">
                        <ThemeIcon size={36} radius="md" color="gray" variant="light">
                          <CreditCard size={18} />
                        </ThemeIcon>
                        <div>
                          <Text size="sm" fw={600}>
                            Sandbox License
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
                  </Paper>

                  {sessionError && <ApiErrorAlert error={sessionError} />}
                  {confirmError && <ApiErrorAlert error={confirmError} />}
                  {!session && !sessionError ? (
                    <Skeleton height={40} radius="md" />
                  ) : (
                    <Button
                      fullWidth
                      size="md"
                      color={primaryColor}
                      loading={isConfirming}
                      onClick={handleConfirm}
                    >
                      {t('billing.confirmOrder', 'Confirm Order')}
                    </Button>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        ) : (
          <Alert color="orange" variant="light">
            {t('billing.contactOwner', 'Contact your company owner to manage billing.')}
          </Alert>
        )}
      </Stack>
    </Container>
  )
}

export default Checkout