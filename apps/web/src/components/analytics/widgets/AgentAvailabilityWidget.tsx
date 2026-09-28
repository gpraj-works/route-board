import React from 'react'
import { Badge, Grid, Group, Paper, Progress, Stack, Text, Title, Tooltip } from '@mantine/core'
import { AgentStatus } from '@whosonsite/shared'
import { UserCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAnalyticsSummary } from '../queries'

export const AgentAvailabilityWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: summary, isLoading } = useAnalyticsSummary()

  return (
    <Paper radius="md" p="md" withBorder style={{ height: '100%' }}>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={5}>{t('analytics.agentAvailability', 'Field Agent Availability')}</Title>
          <UserCheck size={18} style={{ color: 'gray' }} />
        </Group>

        {isLoading ? (
          <Text size="xs" c="dimmed">
            {t('common.loading', 'Loading availability...')}
          </Text>
        ) : (
          <Stack gap="md">
            <Grid gutter="sm">
              <Grid.Col span={4}>
                <Paper p="sm" withBorder radius="md" ta="center" bg="var(--mantine-color-green-0)">
                  <Badge color="green" size="sm" mb={4}>
                    AVAILABLE
                  </Badge>
                  <Text fw={700} size="lg" c="green">
                    {summary?.agentAvailability[AgentStatus.AVAILABLE] || 0}
                  </Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={4}>
                <Paper p="sm" withBorder radius="md" ta="center" bg="var(--mantine-color-orange-0)">
                  <Badge color="orange" size="sm" mb={4}>
                    BUSY
                  </Badge>
                  <Text fw={700} size="lg" c="orange">
                    {summary?.agentAvailability[AgentStatus.BUSY] || 0}
                  </Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={4}>
                <Paper p="sm" withBorder radius="md" ta="center" bg="var(--mantine-color-gray-0)">
                  <Badge color="gray" size="sm" mb={4}>
                    OFFLINE
                  </Badge>
                  <Text fw={700} size="lg" c="gray">
                    {summary?.agentAvailability[AgentStatus.OFFLINE] || 0}
                  </Text>
                </Paper>
              </Grid.Col>
            </Grid>

            <Paper p="sm" withBorder radius="md">
              <Text size="xs" fw={600} mb="xs">
                {t('analytics.capacitySplit', 'Overall Capacity Split')}
              </Text>
              <Progress.Root size="xl" radius="xl">
                <Tooltip
                  label={`Available: ${summary?.agentAvailability[AgentStatus.AVAILABLE] || 0}`}
                >
                  <Progress.Section
                    value={
                      ((summary?.agentAvailability[AgentStatus.AVAILABLE] || 0) /
                        (summary?.totalAgentsCount || 1)) *
                      100
                    }
                    color="green"
                  >
                    <Progress.Label>Available</Progress.Label>
                  </Progress.Section>
                </Tooltip>
                <Tooltip label={`Busy: ${summary?.agentAvailability[AgentStatus.BUSY] || 0}`}>
                  <Progress.Section
                    value={
                      ((summary?.agentAvailability[AgentStatus.BUSY] || 0) /
                        (summary?.totalAgentsCount || 1)) *
                      100
                    }
                    color="orange"
                  >
                    <Progress.Label>Busy</Progress.Label>
                  </Progress.Section>
                </Tooltip>
                <Tooltip label={`Offline: ${summary?.agentAvailability[AgentStatus.OFFLINE] || 0}`}>
                  <Progress.Section
                    value={
                      ((summary?.agentAvailability[AgentStatus.OFFLINE] || 0) /
                        (summary?.totalAgentsCount || 1)) *
                      100
                    }
                    color="gray"
                  >
                    <Progress.Label>Offline</Progress.Label>
                  </Progress.Section>
                </Tooltip>
              </Progress.Root>
            </Paper>
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}
