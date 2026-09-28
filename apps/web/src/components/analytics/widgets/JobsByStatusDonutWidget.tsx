import React from 'react'
import { Group, Paper, Stack, Text, Title } from '@mantine/core'
import { DonutChart } from '@mantine/charts'
import { formatJobStatus, JobStatus } from '@whosonsite/shared'
import { BarChart2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { JOB_STATUS_COLORS } from '../../../app/theme'
import { useAnalyticsSummary } from '../queries'

export const JobsByStatusDonutWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: summary, isLoading } = useAnalyticsSummary()

  const statusData = Object.values(JobStatus)
    .map((status) => ({
      name: formatJobStatus(status).toUpperCase(),
      value: summary?.jobsByStatus[status] || 0,
      color: JOB_STATUS_COLORS[status]
    }))
    .filter((item) => item.value > 0)

  return (
    <Paper radius="md" p="md" withBorder style={{ height: '100%' }}>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={5}>{t('analytics.jobsDistribution', 'Jobs Distribution by Status')}</Title>
          <BarChart2 size={18} style={{ color: 'gray' }} />
        </Group>

        {isLoading ? (
          <Text size="xs" c="dimmed">
            {t('common.loading', 'Loading breakdown...')}
          </Text>
        ) : (
          <Stack align="center" gap="md">
            <DonutChart
              h={220}
              w={220}
              data={statusData}
              thickness={26}
              paddingAngle={2}
              withLabels
              labelsType="percent"
              chartLabel={`${summary?.totalJobsCount || 0} Jobs`}
            />
            <Group gap="sm" justify="center" wrap="wrap">
              {statusData.map((item) => (
                <Group key={item.name} gap={6}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: `var(--mantine-color-${item.color}-6)`,
                      display: 'inline-block'
                    }}
                  />
                  <Text size="xs" fw={600}>
                    {item.name} ({item.value})
                  </Text>
                </Group>
              ))}
            </Group>
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}
