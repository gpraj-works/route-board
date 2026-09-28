import { useQuery } from '@tanstack/react-query'
import { fetchAnalyticsSummary, fetchPersonalAnalytics } from './api'

export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: () => [...analyticsKeys.all, 'summary'] as const,
  me: () => [...analyticsKeys.all, 'me'] as const
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: () => fetchAnalyticsSummary(),
    refetchInterval: 30000
  })
}

export function usePersonalAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.me(),
    queryFn: () => fetchPersonalAnalytics(),
    refetchInterval: 30000
  })
}
