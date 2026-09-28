import React from 'react'
import { Card, Grid, Group, Text } from '@mantine/core'
import { Briefcase, CheckCircle2, Clock, Timer, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAnalyticsSummary } from '../queries'

export const AnalyticsStatTilesWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: summary, isLoading } = useAnalyticsSummary()

  const activeJobsCount =
    (summary?.jobsByStatus.assigned || 0) +
    (summary?.jobsByStatus.en_route || 0) +
    (summary?.jobsByStatus.on_site || 0)

  return (
    <Grid gutter="sm">
      <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
        <Card withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              {t('analytics.totalJobs', 'Total Jobs')}
            </Text>
            <Briefcase size={20} style={{ color: 'gray' }} />
          </Group>
          <Text fw={700} size="xl" mt="xs">
            {isLoading ? '...' : summary?.totalJobsCount || 0}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            {t('analytics.totalJobsDesc', 'All time company dispatches')}
          </Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
        <Card withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              {t('analytics.activeJobs', 'Active Jobs')}
            </Text>
            <Clock size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
          </Group>
          <Text fw={700} size="xl" mt="xs" c="blue">
            {isLoading ? '...' : activeJobsCount}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            {t('analytics.activeJobsDesc', 'Assigned, En Route & On Site')}
          </Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
        <Card withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              {t('analytics.completed', 'Completed')}
            </Text>
            <CheckCircle2 size={20} style={{ color: 'var(--mantine-color-green-6)' }} />
          </Group>
          <Text fw={700} size="xl" mt="xs" c="green">
            {isLoading ? '...' : summary?.jobsByStatus.complete || 0}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            {t('analytics.completedDesc', 'Successfully resolved')}
          </Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
        <Card withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              {t('analytics.avgDuration', 'Avg Duration')}
            </Text>
            <Timer size={20} style={{ color: 'var(--mantine-color-indigo-6)' }} />
          </Group>
          <Text fw={700} size="xl" mt="xs" c="indigo">
            {isLoading ? '...' : `${summary?.avgCompletionTimeMinutes || 0}m`}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            {t('analytics.avgDurationDesc', 'Mean job completion time')}
          </Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
        <Card withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              {t('analytics.fieldTechs', 'Field Techs')}
            </Text>
            <Users size={20} style={{ color: 'var(--mantine-color-teal-6)' }} />
          </Group>
          <Text fw={700} size="xl" mt="xs" c="teal">
            {isLoading ? '...' : summary?.totalAgentsCount || 0}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            {t('analytics.fieldTechsDesc', 'Registered agents')}
          </Text>
        </Card>
      </Grid.Col>
    </Grid>
  )
}
