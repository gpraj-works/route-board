import React from 'react'
import { Card, Group, RingProgress, Text, Title } from '@mantine/core'
import { JobStatus } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../../../app/theme/ThemeContext'
import { useJobs } from '../../jobs/queries'

export const DispatchCompletionWidget: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: jobs = [] } = useJobs()

  const completedToday = jobs.filter((j) => j.status === JobStatus.COMPLETE).length
  const completionPct = jobs.length > 0 ? Math.round((completedToday / jobs.length) * 100) : 0

  return (
    <Card radius="md" withBorder shadow="xs" p="md" style={{ height: '100%' }}>
      <Group justify="space-between" mb="xs">
        <Title order={5}>{t('dashboard.dispatchCompletion', 'Dispatch Completion')}</Title>
        <Text size="xs" c="dimmed" fw={600}>
          {completedToday} / {jobs.length} {t('dashboard.jobsShort', 'Jobs')}
        </Text>
      </Group>
      <Group justify="center" my="xs">
        <RingProgress
          size={130}
          thickness={12}
          roundCaps
          sections={[{ value: completionPct, color: primaryColor }]}
          label={
            <Text ta="center" fw={700} size="lg">
              {completionPct}%
            </Text>
          }
        />
      </Group>
      <Text size="xs" c="dimmed" ta="center">
        {t('dashboard.dispatchProgressLabel', 'Live metrics for company operations')}
      </Text>
    </Card>
  )
}
