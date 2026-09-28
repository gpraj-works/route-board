import React from 'react'
import { Badge, Button, Card, Group, Progress, Stack, Text, Title, Tooltip } from '@mantine/core'
import { UserRole } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppTheme } from '../../../app/theme/ThemeContext'
import { useUsers } from '../../people/queries'

export const TeamSnapshotWidget: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: users = [], isLoading } = useUsers()

  const adminsCount = users.filter((u) => u.role === UserRole.ADMIN).length
  const staffCount = users.filter((u) => u.role === UserRole.STAFF).length
  const agentsCount = users.filter((u) => u.role === UserRole.AGENT).length
  const ownersCount = users.filter((u) => u.role === UserRole.OWNER).length

  const total = users.length || 1

  return (
    <Card radius="md" withBorder shadow="xs" p="md" style={{ height: '100%' }}>
      <Group justify="space-between" mb="sm">
        <div>
          <Title order={5}>{t('dashboard.teamSnapshot', 'Team Members')}</Title>
          <Text size="xs" c="dimmed">
            {users.length} {t('dashboard.totalActiveStaff', 'configured accounts')}
          </Text>
        </div>
        <Button size="xs" variant="subtle" color={primaryColor} component={Link} to="/people">
          {t('dashboard.manageTeam', 'Manage')}
        </Button>
      </Group>

      {isLoading ? (
        <Text size="xs" c="dimmed">
          {t('common.loading', 'Loading team...')}
        </Text>
      ) : (
        <Stack gap="sm">
          <Group justify="space-between" grow>
            <Card withBorder radius="sm" p="xs" ta="center">
              <Badge color="red" size="xs" variant="light">
                {t('role.owner', 'OWNER')}
              </Badge>
              <Text fw={700} size="md" mt={4}>
                {ownersCount}
              </Text>
            </Card>
            <Card withBorder radius="sm" p="xs" ta="center">
              <Badge color="blue" size="xs" variant="light">
                {t('role.admin', 'ADMIN')}
              </Badge>
              <Text fw={700} size="md" mt={4}>
                {adminsCount}
              </Text>
            </Card>
            <Card withBorder radius="sm" p="xs" ta="center">
              <Badge color="violet" size="xs" variant="light">
                {t('role.staff', 'STAFF')}
              </Badge>
              <Text fw={700} size="md" mt={4}>
                {staffCount}
              </Text>
            </Card>
            <Card withBorder radius="sm" p="xs" ta="center">
              <Badge color="teal" size="xs" variant="light">
                {t('role.agent', 'AGENT')}
              </Badge>
              <Text fw={700} size="md" mt={4}>
                {agentsCount}
              </Text>
            </Card>
          </Group>

          <Progress.Root size="lg" radius="xl">
            <Tooltip label={`Admins: ${adminsCount}`}>
              <Progress.Section value={(adminsCount / total) * 100} color="blue">
                <Progress.Label>Admins</Progress.Label>
              </Progress.Section>
            </Tooltip>
            <Tooltip label={`Staff: ${staffCount}`}>
              <Progress.Section value={(staffCount / total) * 100} color="violet">
                <Progress.Label>Staff</Progress.Label>
              </Progress.Section>
            </Tooltip>
            <Tooltip label={`Agents: ${agentsCount}`}>
              <Progress.Section value={(agentsCount / total) * 100} color="teal">
                <Progress.Label>Agents</Progress.Label>
              </Progress.Section>
            </Tooltip>
          </Progress.Root>
        </Stack>
      )}
    </Card>
  )
}
