import React from 'react'
import { useTranslation } from 'react-i18next'
import { useJobs } from '../../jobs/queries'
import { DashboardTable } from '../DashboardTable'

export const RecentJobsTableWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs()
  const recentJobs = jobs.slice(0, 5)

  return (
    <DashboardTable
      title={t('dashboard.recentJobs', 'Recent Dispatch Jobs')}
      subtitle={t('dashboard.recentJobsSubtitle', 'Active jobs and field operations tracking')}
      jobs={recentJobs}
      loading={isLoadingJobs}
      emptyMessage={t('dashboard.noJobsMessage', 'No jobs created yet.')}
      viewAllTo="/jobs"
      viewAllLabel={t('dashboard.viewAllJobs', 'View All Jobs')}
    />
  )
}
