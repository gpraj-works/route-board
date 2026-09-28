import React from 'react'
import { UserRole } from '@whosonsite/shared'
import {
  ActiveJobsWidget,
  AgentsOnlineWidget,
  AssignedWidget,
  CompletedTodayWidget,
  EnRouteWidget,
  OnSiteWidget,
  TotalJobsWidget,
  UnassignedJobsWidget
} from './widgets/StatWidgets'
import { RecentJobsTableWidget } from './widgets/RecentJobsTableWidget'
import { DispatchCompletionWidget } from './widgets/DispatchCompletionWidget'
import { FieldAgentsWidget } from './widgets/FieldAgentsWidget'
import { CustomersSnapshotWidget } from './widgets/CustomersSnapshotWidget'
import { TeamSnapshotWidget } from './widgets/TeamSnapshotWidget'
import { BillingOverviewWidget } from './widgets/BillingOverviewWidget'
import {
  CompletionRateWidget,
  MyJobsTodayWidget,
  MyPerformanceWidget,
  NextAppointmentWidget,
  TodayScheduleWidget
} from './widgets/AgentWidgets'

export type DashboardWidgetId =
  | 'activeJobs'
  | 'agentsOnline'
  | 'completedToday'
  | 'unassignedJobs'
  | 'enRoute'
  | 'onSite'
  | 'assigned'
  | 'totalJobs'
  | 'recentJobsTable'
  | 'dispatchCompletion'
  | 'fieldAgents'
  | 'customersSnapshot'
  | 'teamSnapshot'
  | 'billingOverview'
  | 'myJobsToday'
  | 'nextAppointment'
  | 'completionRate'
  | 'todaySchedule'
  | 'myPerformance'

export interface DashboardWidgetDescriptor {
  id: DashboardWidgetId
  component: React.ComponentType
  span: { base: number; sm?: number; md?: number; lg?: number; xl?: number }
}

export const DASHBOARD_WIDGET_REGISTRY: Record<DashboardWidgetId, DashboardWidgetDescriptor> = {
  activeJobs: {
    id: 'activeJobs',
    component: ActiveJobsWidget,
    span: { base: 12, sm: 6, md: 3 }
  },
  agentsOnline: {
    id: 'agentsOnline',
    component: AgentsOnlineWidget,
    span: { base: 12, sm: 6, md: 3 }
  },
  completedToday: {
    id: 'completedToday',
    component: CompletedTodayWidget,
    span: { base: 12, sm: 6, md: 3 }
  },
  unassignedJobs: {
    id: 'unassignedJobs',
    component: UnassignedJobsWidget,
    span: { base: 12, sm: 6, md: 3 }
  },
  enRoute: {
    id: 'enRoute',
    component: EnRouteWidget,
    span: { base: 12, sm: 6, md: 3 }
  },
  onSite: {
    id: 'onSite',
    component: OnSiteWidget,
    span: { base: 12, sm: 6, md: 3 }
  },
  assigned: {
    id: 'assigned',
    component: AssignedWidget,
    span: { base: 12, sm: 6, md: 3 }
  },
  totalJobs: {
    id: 'totalJobs',
    component: TotalJobsWidget,
    span: { base: 12, sm: 6, md: 3 }
  },
  recentJobsTable: {
    id: 'recentJobsTable',
    component: RecentJobsTableWidget,
    span: { base: 12, lg: 8 }
  },
  dispatchCompletion: {
    id: 'dispatchCompletion',
    component: DispatchCompletionWidget,
    span: { base: 12, sm: 6, lg: 4 }
  },
  fieldAgents: {
    id: 'fieldAgents',
    component: FieldAgentsWidget,
    span: { base: 12, sm: 6, lg: 4 }
  },
  customersSnapshot: {
    id: 'customersSnapshot',
    component: CustomersSnapshotWidget,
    span: { base: 12, sm: 6, lg: 4 }
  },
  teamSnapshot: {
    id: 'teamSnapshot',
    component: TeamSnapshotWidget,
    span: { base: 12, sm: 6, lg: 4 }
  },
  billingOverview: {
    id: 'billingOverview',
    component: BillingOverviewWidget,
    span: { base: 12, sm: 6, lg: 4 }
  },
  myJobsToday: {
    id: 'myJobsToday',
    component: MyJobsTodayWidget,
    span: { base: 12, sm: 4 }
  },
  nextAppointment: {
    id: 'nextAppointment',
    component: NextAppointmentWidget,
    span: { base: 12, sm: 4 }
  },
  completionRate: {
    id: 'completionRate',
    component: CompletionRateWidget,
    span: { base: 12, sm: 4 }
  },
  todaySchedule: {
    id: 'todaySchedule',
    component: TodayScheduleWidget,
    span: { base: 12 }
  },
  myPerformance: {
    id: 'myPerformance',
    component: MyPerformanceWidget,
    span: { base: 12 }
  }
}

export const DASHBOARD_WIDGETS_BY_ROLE: Record<UserRole, DashboardWidgetId[]> = {
  [UserRole.OWNER]: [
    'activeJobs',
    'agentsOnline',
    'completedToday',
    'unassignedJobs',
    'enRoute',
    'onSite',
    'assigned',
    'totalJobs',
    'recentJobsTable',
    'dispatchCompletion',
    'fieldAgents',
    'customersSnapshot',
    'teamSnapshot',
    'billingOverview'
  ],
  [UserRole.ADMIN]: [
    'activeJobs',
    'agentsOnline',
    'completedToday',
    'unassignedJobs',
    'enRoute',
    'onSite',
    'assigned',
    'totalJobs',
    'recentJobsTable',
    'dispatchCompletion',
    'fieldAgents',
    'customersSnapshot',
    'teamSnapshot'
  ],
  [UserRole.STAFF]: ['customersSnapshot', 'recentJobsTable', 'fieldAgents', 'dispatchCompletion'],
  [UserRole.AGENT]: [
    'myJobsToday',
    'nextAppointment',
    'completionRate',
    'todaySchedule',
    'myPerformance'
  ]
}
