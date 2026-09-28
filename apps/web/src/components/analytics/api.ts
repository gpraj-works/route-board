import { AnalyticsSummaryDto, PersonalAnalyticsDto } from '@whosonsite/shared'
import { apiClient } from '../../lib/api'

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummaryDto> {
  return apiClient<AnalyticsSummaryDto>('/analytics/summary')
}

export async function fetchPersonalAnalytics(): Promise<PersonalAnalyticsDto> {
  return apiClient<PersonalAnalyticsDto>('/analytics/me')
}
