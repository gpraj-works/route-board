import React from 'react'
import { Avatar, Button, Card, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { MapPin, Phone, UserCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppTheme } from '../../../app/theme/ThemeContext'
import { useCustomers } from '../../customers/queries'

export const CustomersSnapshotWidget: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: customers = [], isLoading } = useCustomers()

  return (
    <Card radius="md" withBorder shadow="xs" p="md" style={{ height: '100%' }}>
      <Group justify="space-between" mb="sm">
        <div>
          <Title order={5}>{t('dashboard.customersSnapshot', 'Customers Overview')}</Title>
          <Text size="xs" c="dimmed">
            {customers.length} {t('dashboard.registeredClients', 'clients in directory')}
          </Text>
        </div>
        <Button size="xs" variant="subtle" color={primaryColor} component={Link} to="/customers">
          {t('dashboard.viewAllCustomers', 'View All')}
        </Button>
      </Group>

      <Stack gap="xs">
        {isLoading ? (
          <Text size="xs" c="dimmed">
            {t('common.loading', 'Loading customers...')}
          </Text>
        ) : customers.length === 0 ? (
          <Text size="xs" c="dimmed">
            {t('dashboard.noCustomersMessage', 'No customers added yet.')}
          </Text>
        ) : (
          customers.slice(0, 4).map((cust) => (
            <Paper key={cust.id} p="xs" radius="sm" withBorder bg="var(--mantine-color-body)">
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap">
                  <Avatar size="sm" radius="xl" color="blue">
                    <UserCheck size={14} />
                  </Avatar>
                  <div style={{ minWidth: 0 }}>
                    <Text size="xs" fw={600} truncate>
                      {cust.name}
                    </Text>
                    <Group gap={4} wrap="nowrap">
                      <Phone size={11} style={{ opacity: 0.6 }} />
                      <Text size="xs" c="dimmed" truncate>
                        {cust.mobile || '—'}
                      </Text>
                    </Group>
                  </div>
                </Group>
                {cust.address && (
                  <Group gap={4} wrap="nowrap" visibleFrom="xs">
                    <MapPin size={11} style={{ opacity: 0.6 }} />
                    <Text size="xs" c="dimmed" truncate style={{ maxWidth: 140 }}>
                      {cust.address}
                    </Text>
                  </Group>
                )}
              </Group>
            </Paper>
          ))
        )}
      </Stack>
    </Card>
  )
}
