import React from 'react'
import { UserRole } from '@whosonsite/shared'
import { AnalyticsStatTilesWidget } from './widgets/AnalyticsStatTilesWidget'
import { JobsByStatusDonutWidget } from './widgets/JobsByStatusDonutWidget'
import { AgentAvailabilityWidget } from './widgets/AgentAvailabilityWidget'
import { JobsTrendBarWidget } from './widgets/JobsTrendBarWidget'
import { TopAgentsTableWidget } from './widgets/TopAgentsTableWidget'
import { TeamSnapshotWidget } from '../dashboard/widgets/TeamSnapshotWidget'
import { BillingOverviewWidget } from '../dashboard/widgets/BillingOverviewWidget'

export type AnalyticsWidgetId =
  | 'statTiles'
  | 'jobsByStatusDonut'
  | 'agentAvailability'
  | 'jobsTrendBar'
  | 'topAgentsTable'
  | 'teamSnapshot'
  | 'billingOverview'

export interface AnalyticsWidgetDescriptor {
  id: AnalyticsWidgetId
  component: React.ComponentType
  span: { base: number; sm?: number; md?: number; lg?: number; xl?: number }
}

export const ANALYTICS_WIDGET_REGISTRY: Record<AnalyticsWidgetId, AnalyticsWidgetDescriptor> = {
  statTiles: {
    id: 'statTiles',
    component: AnalyticsStatTilesWidget,
    span: { base: 12 }
  },
  jobsByStatusDonut: {
    id: 'jobsByStatusDonut',
    component: JobsByStatusDonutWidget,
    span: { base: 12, md: 6 }
  },
  agentAvailability: {
    id: 'agentAvailability',
    component: AgentAvailabilityWidget,
    span: { base: 12, md: 6 }
  },
  jobsTrendBar: {
    id: 'jobsTrendBar',
    component: JobsTrendBarWidget,
    span: { base: 12 }
  },
  topAgentsTable: {
    id: 'topAgentsTable',
    component: TopAgentsTableWidget,
    span: { base: 12, lg: 8 }
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
  }
}

export const ANALYTICS_WIDGETS_BY_ROLE: Record<UserRole, AnalyticsWidgetId[]> = {
  [UserRole.OWNER]: [
    'statTiles',
    'jobsByStatusDonut',
    'agentAvailability',
    'jobsTrendBar',
    'topAgentsTable',
    'teamSnapshot',
    'billingOverview'
  ],
  [UserRole.ADMIN]: [
    'statTiles',
    'jobsByStatusDonut',
    'agentAvailability',
    'jobsTrendBar',
    'topAgentsTable',
    'teamSnapshot'
  ],
  [UserRole.STAFF]: [],
  [UserRole.AGENT]: []
}
