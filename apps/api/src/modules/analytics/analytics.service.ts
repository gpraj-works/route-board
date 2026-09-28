import { AnalyticsSummaryDto, PersonalAnalyticsDto } from '@whosonsite/shared'
import * as analyticsRepo from './analytics.repository'

/**
 * Service function fetching company-scoped analytics summary metrics
 */
export async function getCompanyAnalyticsSummary(companyId: string): Promise<AnalyticsSummaryDto> {
  return analyticsRepo.fetchAnalyticsSummary(companyId)
}

/**
 * Service function fetching technician-scoped personal analytics metrics
 */
export async function getPersonalAnalytics(
  companyId: string,
  userId: string
): Promise<PersonalAnalyticsDto> {
  return analyticsRepo.fetchPersonalAnalytics(companyId, userId)
}
