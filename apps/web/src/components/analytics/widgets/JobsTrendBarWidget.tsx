import React from 'react'
import { Badge, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { BarChart } from '@mantine/charts'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../../../app/theme'
import { useAnalyticsSummary } from '../queries'

export const JobsTrendBarWidget: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: summary, isLoading } = useAnalyticsSummary()

  const trendData =
    summary?.jobsCreatedLast14Days.map((d) => ({
      date: d.date.slice(5),
      jobs: d.count
    })) || []

  return (
    <Paper radius="md" p="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <div>
            <Title order={5}>
              {t('analytics.jobCreationTrend', 'Job Creation Trend (Last 14 Days)')}
            </Title>
            <Text size="xs" c="dimmed">
              {t(
                'analytics.jobCreationSubtitle',
                'Daily job creation velocity across company dispatches'
              )}
            </Text>
          </div>
          <Badge color={primaryColor} variant="light">
            {t('analytics.past14Days', 'Past 14 Days')}
          </Badge>
        </Group>

        {isLoading ? (
          <Text size="xs" c="dimmed">
            {t('common.loading', 'Loading trend...')}
          </Text>
        ) : (
          <BarChart
            h={240}
            data={trendData}
            dataKey="date"
            series={[{ name: 'jobs', color: primaryColor }]}
            withBarValueLabel
            withTooltip
            tickLine="y"
            gridAxis="xy"
          />
        )}
      </Stack>
    </Paper>
  )
}
