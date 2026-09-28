import React, { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { dayjs, formatDateTime, formatTime, JobStatus } from '@whosonsite/shared'
import { CheckCircle2, Clock, MapPin, Navigation, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../app/theme'
import { PageHeader } from '../components/common/PageHeader'
import { StatusBadge } from '../components/common/StatusBadge'
import { ApiErrorAlert } from '../components/feedback/ApiErrorAlert'
import { JobMap } from '../components/jobs/JobMap'
import { useJobs, useUpdateJobStatus } from '../components/jobs/queries'

export const RoutePlans: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const today = dayjs().format('YYYY-MM-DD')

  const { data: todayJobs = [], isLoading, error } = useJobs({ date: today, limit: 100 })
  const updateStatusMutation = useUpdateJobStatus()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  // Sort today's jobs chronologically by scheduled time
  const sortedStops = useMemo(() => {
    return [...todayJobs].sort((a, b) => {
      const timeA = a.scheduledAt ? dayjs(a.scheduledAt).valueOf() : dayjs(a.createdAt).valueOf()
      const timeB = b.scheduledAt ? dayjs(b.scheduledAt).valueOf() : dayjs(b.createdAt).valueOf()
      return timeA - timeB
    })
  }, [todayJobs])

  const handleTransition = async (jobId: string, status: JobStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: jobId, status })
    } catch {
      // Error handled by mutation state
    }
  }

  return (
    <Container
      fluid
      p={0}
      h={{ base: 'auto', md: 'calc(100vh - 80px)' }}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <Stack gap="xs" style={{ height: '100%' }}>
        <PageHeader
          title={t('routePlans.title', 'My Daily Route Plan')}
          subtitle={t(
            'routePlans.subtitle',
            'Chronological stops, navigation coordinates, and execution progress for today'
          )}
          actions={
            <Badge size="lg" color={primaryColor} variant="light">
              {dayjs().format('dddd, MMMM D, YYYY')}
            </Badge>
          }
        />

        <ApiErrorAlert error={error || updateStatusMutation.error} />

        <Flex direction={{ base: 'column', md: 'row' }} gap="sm" style={{ flex: 1, minHeight: 0 }}>
          {/* Stops List Column */}
          <Paper
            w={{ base: '100%', md: '45%', lg: '40%' }}
            radius="md"
            p="sm"
            withBorder
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <Navigation size={18} style={{ color: `var(--mantine-color-${primaryColor}-6)` }} />
                <Title order={5}>
                  {t('routePlans.stopsTitle', 'Scheduled Stops')} ({sortedStops.length})
                </Title>
              </Group>
              <Text size="xs" c="dimmed">
                {sortedStops.filter((s) => s.status === JobStatus.COMPLETE).length} /{' '}
                {sortedStops.length} {t('common.completed', 'completed')}
              </Text>
            </Group>

            <ScrollArea type="auto" style={{ flex: 1 }}>
              <Stack gap="xs">
                {isLoading ? (
                  <Text size="sm" c="dimmed" ta="center" py="xl">
                    {t('common.loading', 'Loading route plan...')}
                  </Text>
                ) : sortedStops.length === 0 ? (
                  <Card withBorder radius="md" p="xl" ta="center">
                    <Navigation
                      size={36}
                      style={{ color: 'gray', margin: '0 auto 8px', opacity: 0.5 }}
                    />
                    <Text size="sm" fw={600}>
                      {t('routePlans.noStopsToday', 'No scheduled stops for today')}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t(
                        'routePlans.noStopsDesc',
                        'Assigned jobs scheduled for today will automatically appear here.'
                      )}
                    </Text>
                  </Card>
                ) : (
                  sortedStops.map((job, index) => {
                    const isSelected = selectedJobId === job.id
                    const isDone = job.status === JobStatus.COMPLETE
                    const isCancelled = job.status === JobStatus.CANCELLED

                    return (
                      <Card
                        key={job.id}
                        withBorder
                        radius="md"
                        p="sm"
                        onClick={() => setSelectedJobId(job.id)}
                        style={{
                          cursor: 'pointer',
                          borderColor: isSelected
                            ? `var(--mantine-color-${primaryColor}-6)`
                            : undefined,
                          backgroundColor: isSelected
                            ? 'var(--mantine-color-default-hover)'
                            : isDone
                              ? 'var(--mantine-color-green-0)'
                              : undefined
                        }}
                      >
                        <Stack gap="xs">
                          <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Group gap="xs" wrap="nowrap">
                              <Badge
                                size="md"
                                circle
                                color={isDone ? 'green' : isSelected ? primaryColor : 'gray'}
                              >
                                {index + 1}
                              </Badge>
                              <div>
                                <Text size="sm" fw={700}>
                                  {job.customer?.name || t('jobs.noCustomer', 'Customer')}
                                </Text>
                                <Group gap={4} wrap="nowrap">
                                  <Clock size={12} style={{ opacity: 0.6 }} />
                                  <Text size="xs" c="dimmed">
                                    {job.scheduledAt
                                      ? formatTime(job.scheduledAt)
                                      : formatDateTime(job.createdAt)}
                                  </Text>
                                </Group>
                              </div>
                            </Group>
                            <StatusBadge status={job.status} />
                          </Group>

                          {job.customer?.address && (
                            <Group gap={6} wrap="nowrap">
                              <MapPin size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
                              <Text size="xs" c="dimmed" truncate>
                                {job.customer.address}
                              </Text>
                            </Group>
                          )}

                          {job.customer?.mobile && (
                            <Group gap={6} wrap="nowrap">
                              <Phone size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
                              <Text size="xs" c="dimmed">
                                {job.customer.mobile}
                              </Text>
                            </Group>
                          )}

                          {/* Quick Action Progression Buttons */}
                          {!isDone && !isCancelled && (
                            <Group gap="xs" mt={4}>
                              {job.status === JobStatus.ASSIGNED && (
                                <Button
                                  size="xs"
                                  variant="light"
                                  color="blue"
                                  leftSection={<Navigation size={13} />}
                                  loading={updateStatusMutation.isPending}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleTransition(job.id, JobStatus.EN_ROUTE)
                                  }}
                                >
                                  {t('statusActions.startTravel', 'Start Travel')}
                                </Button>
                              )}

                              {job.status === JobStatus.EN_ROUTE && (
                                <Button
                                  size="xs"
                                  variant="light"
                                  color="cyan"
                                  leftSection={<MapPin size={13} />}
                                  loading={updateStatusMutation.isPending}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleTransition(job.id, JobStatus.ON_SITE)
                                  }}
                                >
                                  {t('statusActions.arriveOnSite', 'Arrive On Site')}
                                </Button>
                              )}

                              {job.status === JobStatus.ON_SITE && (
                                <Button
                                  size="xs"
                                  variant="filled"
                                  color="green"
                                  leftSection={<CheckCircle2 size={13} />}
                                  loading={updateStatusMutation.isPending}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleTransition(job.id, JobStatus.COMPLETE)
                                  }}
                                >
                                  {t('statusActions.markComplete', 'Complete Job')}
                                </Button>
                              )}
                            </Group>
                          )}
                        </Stack>
                      </Card>
                    )
                  })
                )}
              </Stack>
            </ScrollArea>
          </Paper>

          {/* Interactive Map Pane */}
          <Paper radius="md" withBorder style={{ flex: 1, minHeight: 400, overflow: 'hidden' }}>
            <JobMap
              jobs={sortedStops}
              agents={[]}
              selectedJobId={selectedJobId}
              onSelectJob={(job) => setSelectedJobId(job.id)}
            />
          </Paper>
        </Flex>
      </Stack>
    </Container>
  )
}

export default RoutePlans
