import React from 'react'
import { Card, Grid, Group, Paper, RingProgress, Text, Title } from '@mantine/core'
import { dayjs, formatTime, JobStatus } from '@whosonsite/shared'
import { CalendarClock, CalendarDays, CheckCircle2, Timer, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../../../app/theme/ThemeContext'
import { usePersonalAnalytics } from '../../analytics/queries'
import { useJobs } from '../../jobs/queries'
import { DashboardTable } from '../DashboardTable'
import { StatCard } from '../StatCard'

export const MyJobsTodayWidget: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const today = dayjs().format('YYYY-MM-DD')
  const { data: todayJobs = [] } = useJobs({ date: today, limit: 100 })

  const activeToday = todayJobs.filter(
    (j) => j.status !== JobStatus.COMPLETE && j.status !== JobStatus.CANCELLED
  ).length

  return (
    <StatCard
      title={t('dashboard.myJobsToday', 'My Jobs Today')}
      value={String(todayJobs.length)}
      icon={CalendarDays}
      color={primaryColor}
      description={t('dashboard.myJobsTodayDesc', '{{count}} active today', {
        count: activeToday
      })}
    />
  )
}

export const NextAppointmentWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: allJobs = [] } = useJobs({ limit: 100 })

  const nextAppointment =
    allJobs
      .filter(
        (j) =>
          j.status !== JobStatus.COMPLETE &&
          j.status !== JobStatus.CANCELLED &&
          j.scheduledAt &&
          dayjs(j.scheduledAt).isAfter(dayjs())
      )
      .sort((a, b) => dayjs(a.scheduledAt as string).diff(dayjs(b.scheduledAt as string)))[0] ??
    null

  return (
    <StatCard
      title={t('dashboard.nextAppointment', 'Next Appointment')}
      value={nextAppointment ? formatTime(nextAppointment.scheduledAt) : '—'}
      icon={CalendarClock}
      color="blue"
      description={
        nextAppointment
          ? nextAppointment.customer?.name || t('jobs.noCustomer', 'Assigned Customer')
          : t('dashboard.noneScheduled', 'No upcoming appointments')
      }
    />
  )
}

export const CompletionRateWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: allJobs = [] } = useJobs({ limit: 100 })

  const totalAssigned = allJobs.length
  const completedCount = allJobs.filter((j) => j.status === JobStatus.COMPLETE).length
  const completionPct = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0

  return (
    <StatCard
      title={t('dashboard.completionRate', 'Completion Rate')}
      value={`${completionPct}%`}
      icon={TrendingUp}
      color="green"
      description={`${completedCount} ${t('dashboard.completedOf', 'of')} ${totalAssigned} ${t(
        'dashboard.jobsCompleted',
        'jobs completed'
      )}`}
    />
  )
}

export const TodayScheduleWidget: React.FC = () => {
  const { t } = useTranslation()
  const today = dayjs().format('YYYY-MM-DD')
  const { data: todayJobs = [], isLoading: isLoadingToday } = useJobs({ date: today, limit: 100 })

  return (
    <DashboardTable
      title={t('dashboard.todaySchedule', "Today's Schedule")}
      subtitle={t('dashboard.todayScheduleSubtitle', 'Assigned jobs scheduled for today')}
      jobs={todayJobs}
      columns={['customer', 'status', 'scheduledAt']}
      loading={isLoadingToday}
      emptyMessage={t('dashboard.noTodayJobs', 'No jobs scheduled for today.')}
      viewAllTo="/my-jobs"
      viewAllLabel={t('dashboard.viewAllJobs', 'View All Jobs')}
    />
  )
}

export const MyPerformanceWidget: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: metrics, isLoading } = usePersonalAnalytics()

  return (
    <Card radius="md" withBorder shadow="xs" p="md">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={5}>{t('personal.performanceTitle', 'My Performance & Efficiency')}</Title>
          <Text size="xs" c="dimmed">
            {t('personal.performanceSubtitle', 'Personal dispatch metrics and resolution velocity')}
          </Text>
        </div>
      </Group>

      {isLoading ? (
        <Text size="xs" c="dimmed">
          {t('common.loading', 'Loading performance data...')}
        </Text>
      ) : (
        <Grid gutter="sm" align="center">
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper p="sm" radius="md" withBorder ta="center">
              <Group justify="center" mb={4}>
                <RingProgress
                  size={110}
                  thickness={10}
                  roundCaps
                  sections={[{ value: metrics?.completionRate || 0, color: primaryColor }]}
                  label={
                    <Text ta="center" fw={700} size="md">
                      {metrics?.completionRate || 0}%
                    </Text>
                  }
                />
              </Group>
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                Resolution Rate
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper p="md" radius="md" withBorder ta="center" style={{ height: '100%' }}>
              <Timer size={24} style={{ color: 'var(--mantine-color-indigo-6)' }} />
              <Text size="xl" fw={700} mt="xs" c="indigo">
                {metrics?.avgCompletionTimeMinutes || 0}m
              </Text>
              <Text size="xs" c="dimmed" fw={600} mt={4}>
                Mean Resolution Time
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper p="md" radius="md" withBorder ta="center" style={{ height: '100%' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--mantine-color-green-6)' }} />
              <Text size="xl" fw={700} mt="xs" c="green">
                {metrics?.completedTodayCount || 0} / {metrics?.todayJobsCount || 0}
              </Text>
              <Text size="xs" c="dimmed" fw={600} mt={4}>
                Resolved Today
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>
      )}
    </Card>
  )
}
