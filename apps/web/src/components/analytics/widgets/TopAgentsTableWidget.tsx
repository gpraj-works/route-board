import React from 'react'
import { Avatar, Badge, Card, Group, Progress, Table, Text, Title } from '@mantine/core'
import { Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../../../app/theme'
import { useAnalyticsSummary } from '../queries'

export const TopAgentsTableWidget: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: summary, isLoading } = useAnalyticsSummary()

  const topAgents = summary?.topAgents || []

  return (
    <Card radius="md" withBorder shadow="xs" p="md">
      <Group justify="space-between" mb="sm">
        <div>
          <Group gap="xs">
            <Trophy size={18} style={{ color: 'var(--mantine-color-yellow-6)' }} />
            <Title order={5}>{t('analytics.topAgentsTitle', 'Top Performing Technicians')}</Title>
          </Group>
          <Text size="xs" c="dimmed">
            {t(
              'analytics.topAgentsSubtitle',
              'Technician dispatch resolution rates and completion velocity'
            )}
          </Text>
        </div>
      </Group>

      <Table.ScrollContainer minWidth={600}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={50}>#</Table.Th>
              <Table.Th>{t('agents.name', 'Agent')}</Table.Th>
              <Table.Th>{t('analytics.completedJobs', 'Completed Jobs')}</Table.Th>
              <Table.Th>{t('analytics.totalJobsAssigned', 'Total Assigned')}</Table.Th>
              <Table.Th>{t('analytics.completionPercentage', 'Resolution Rate')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={5} ta="center" py="md">
                  <Text size="xs" c="dimmed">
                    {t('common.loading', 'Loading performance metrics...')}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : topAgents.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} ta="center" py="md">
                  <Text size="xs" c="dimmed">
                    {t('analytics.noTopAgents', 'No agent job activity recorded yet.')}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              topAgents.map((agent, index) => (
                <Table.Tr key={agent.agentId}>
                  <Table.Td>
                    <Badge
                      size="sm"
                      variant={index === 0 ? 'filled' : 'light'}
                      color={index === 0 ? 'yellow' : 'gray'}
                    >
                      {index + 1}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Avatar color={primaryColor} radius="xl" size="sm">
                        {agent.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Text size="sm" fw={600}>
                        {agent.name}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={700} c="green">
                      {agent.completedJobs}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{agent.totalJobs}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Progress
                        value={agent.completionPct}
                        color={primaryColor}
                        size="md"
                        radius="xl"
                        style={{ width: 80 }}
                      />
                      <Text size="xs" fw={700}>
                        {agent.completionPct}%
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  )
}
