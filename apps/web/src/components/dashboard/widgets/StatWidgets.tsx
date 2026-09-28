import React from 'react'
import { AgentStatus, JobStatus } from '@whosonsite/shared'
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Inbox,
  MapPin,
  Navigation,
  Truck,
  Users
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../../../app/theme/ThemeContext'
import { useAgents } from '../../agents/queries'
import { useJobs } from '../../jobs/queries'
import { StatCard } from '../StatCard'

export const ActiveJobsWidget: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: jobs = [] } = useJobs()

  const activeJobs = jobs.filter(
    (j) => j.status !== JobStatus.COMPLETE && j.status !== JobStatus.CANCELLED
  )
  const unassignedCount = jobs.filter((j) => j.status === JobStatus.UNASSIGNED).length
  const enRouteCount = jobs.filter((j) => j.status === JobStatus.EN_ROUTE).length
  const onSiteCount = jobs.filter((j) => j.status === JobStatus.ON_SITE).length

  return (
    <StatCard
      title={t('dashboard.activeJobs', 'Active Jobs')}
      value={String(activeJobs.length)}
      icon={Truck}
      color={primaryColor}
      description={`${enRouteCount} ${t('dashboard.enRouteField', 'en route')}, ${onSiteCount} ${t(
        'dashboard.onSiteField',
        'on site'
      )}, ${unassignedCount} ${t('dashboard.unassignedField', 'unassigned')}`}
    />
  )
}

export const AgentsOnlineWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: agents = [] } = useAgents()

  const onlineTechs = agents.filter((a) => a.status !== AgentStatus.OFFLINE)
  const availableTechs = agents.filter((a) => a.status === AgentStatus.AVAILABLE)
  const busyTechs = agents.filter((a) => a.status === AgentStatus.BUSY)

  return (
    <StatCard
      title={t('dashboard.agentsOnline', 'Agents Online')}
      value={`${onlineTechs.length} / ${agents.length}`}
      icon={Users}
      color="blue"
      description={`${availableTechs.length} ${t('dashboard.availableField', 'available')}, ${busyTechs.length} ${t(
        'dashboard.busyField',
        'busy'
      )}`}
    />
  )
}

export const CompletedTodayWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: jobs = [] } = useJobs()

  const completedToday = jobs.filter((j) => j.status === JobStatus.COMPLETE).length

  return (
    <StatCard
      title={t('dashboard.completedToday', 'Completed Jobs')}
      value={String(completedToday)}
      icon={CheckCircle2}
      color="green"
      description={`${jobs.length} ${t('dashboard.totalJobsField', 'total jobs recorded')}`}
    />
  )
}

export const UnassignedJobsWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: jobs = [] } = useJobs()

  const unassignedCount = jobs.filter((j) => j.status === JobStatus.UNASSIGNED).length

  return (
    <StatCard
      title={t('dashboard.unassignedJobs', 'Unassigned Jobs')}
      value={String(unassignedCount)}
      icon={Inbox}
      color="orange"
      description={t('dashboard.awaitingDispatch', 'awaiting dispatch')}
    />
  )
}

export const EnRouteWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: jobs = [] } = useJobs()

  const enRouteCount = jobs.filter((j) => j.status === JobStatus.EN_ROUTE).length

  return (
    <StatCard
      title={t('dashboard.enRoute', 'En Route')}
      value={String(enRouteCount)}
      icon={Navigation}
      color="blue"
      description={t('dashboard.enRouteDesc', 'agents traveling to job')}
    />
  )
}

export const OnSiteWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: jobs = [] } = useJobs()

  const onSiteCount = jobs.filter((j) => j.status === JobStatus.ON_SITE).length

  return (
    <StatCard
      title={t('dashboard.onSite', 'On Site')}
      value={String(onSiteCount)}
      icon={MapPin}
      color="cyan"
      description={t('dashboard.onSiteDesc', 'agents currently at job')}
    />
  )
}

export const AssignedWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: jobs = [] } = useJobs()

  const assignedCount = jobs.filter((j) => j.status === JobStatus.ASSIGNED).length

  return (
    <StatCard
      title={t('dashboard.assignedWaiting', 'Assigned')}
      value={String(assignedCount)}
      icon={ClipboardList}
      color="grape"
      description={t('dashboard.assignedDesc', 'dispatched, not yet traveling')}
    />
  )
}

export const TotalJobsWidget: React.FC = () => {
  const { t } = useTranslation()
  const { data: jobs = [] } = useJobs()

  return (
    <StatCard
      title={t('dashboard.totalJobs', 'Total Jobs')}
      value={String(jobs.length)}
      icon={Briefcase}
      color="gray"
      description={t('dashboard.totalJobsDesc', 'all jobs recorded')}
    />
  )
}
