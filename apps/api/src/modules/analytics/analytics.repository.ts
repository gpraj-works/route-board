import { and, count, desc, eq, gte, lte, or, sql } from 'drizzle-orm'
import {
  AgentStatus,
  AnalyticsSummaryDto,
  DailyJobCount,
  dayjs,
  JobStatus,
  PersonalAnalyticsDto,
  TopAgentMetric,
  UserStatus
} from '@whosonsite/shared'
import { db } from '../../infrastructure/database/client'
import { agents, jobs, users } from '../../infrastructure/database/schema'

/**
 * Fetches company-wide operational analytics summary.
 */
export async function fetchAnalyticsSummary(companyId: string): Promise<AnalyticsSummaryDto> {
  // Jobs breakdown by status
  const jobStatusCounts = await db
    .select({
      status: jobs.status,
      count: count()
    })
    .from(jobs)
    .where(eq(jobs.companyId, companyId))
    .groupBy(jobs.status)

  const jobsByStatus: Record<JobStatus, number> = {
    [JobStatus.UNASSIGNED]: 0,
    [JobStatus.ASSIGNED]: 0,
    [JobStatus.EN_ROUTE]: 0,
    [JobStatus.ON_SITE]: 0,
    [JobStatus.COMPLETE]: 0,
    [JobStatus.CANCELLED]: 0
  }

  let totalJobsCount = 0
  for (const row of jobStatusCounts) {
    const statusKey = row.status as JobStatus
    if (statusKey in jobsByStatus) {
      jobsByStatus[statusKey] = Number(row.count)
    }
    totalJobsCount += Number(row.count)
  }

  // Jobs created in the last 14 days
  const fourteenDaysAgo = dayjs().subtract(13, 'day').startOf('day').toDate()
  const rawDailyCounts = await db
    .select({
      dateStr: sql<string>`TO_CHAR(${jobs.createdAt}, 'YYYY-MM-DD')`,
      count: count()
    })
    .from(jobs)
    .where(and(eq(jobs.companyId, companyId), gte(jobs.createdAt, fourteenDaysAgo)))
    .groupBy(sql`TO_CHAR(${jobs.createdAt}, 'YYYY-MM-DD')`)

  const dailyCountMap = new Map<string, number>()
  for (const row of rawDailyCounts) {
    dailyCountMap.set(row.dateStr, Number(row.count))
  }

  const jobsCreatedLast14Days: DailyJobCount[] = []
  let curr = dayjs().subtract(13, 'day').startOf('day')
  const end = dayjs().endOf('day')

  while (curr.isBefore(end) || curr.isSame(end, 'day')) {
    const isoDate = curr.format('YYYY-MM-DD')
    jobsCreatedLast14Days.push({
      date: isoDate,
      count: dailyCountMap.get(isoDate) || 0
    })
    curr = curr.add(1, 'day')
  }

  // Agent availability breakdown
  const techStatusCounts = await db
    .select({
      status: agents.status,
      count: count()
    })
    .from(agents)
    .where(eq(agents.companyId, companyId))
    .groupBy(agents.status)

  const agentAvailability: Record<AgentStatus, number> = {
    [AgentStatus.AVAILABLE]: 0,
    [AgentStatus.BUSY]: 0,
    [AgentStatus.OFFLINE]: 0
  }

  let totalAgentsCount = 0
  for (const row of techStatusCounts) {
    const statusKey = row.status as AgentStatus
    if (statusKey in agentAvailability) {
      agentAvailability[statusKey] = Number(row.count)
    }
    totalAgentsCount += Number(row.count)
  }

  // Mean job duration
  const completedDurationResult = await db
    .select({
      avgMinutes: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${jobs.updatedAt} - ${jobs.createdAt})) / 60), 0)`
    })
    .from(jobs)
    .where(
      and(
        eq(jobs.companyId, companyId),
        eq(jobs.status, JobStatus.COMPLETE),
        sql`${jobs.updatedAt} >= ${jobs.createdAt}`
      )
    )

  const avgCompletionTimeMinutes = Math.round(Number(completedDurationResult[0]?.avgMinutes || 0))

  // Total active users count
  const userCountResult = await db
    .select({ totalUsers: count() })
    .from(users)
    .where(and(eq(users.companyId, companyId), eq(users.status, UserStatus.ACTIVE)))

  const totalUsersCount = Number(userCountResult[0]?.totalUsers || 0)

  // Top agents performance metrics
  const topAgentsRaw = await db
    .select({
      agentId: agents.id,
      name: agents.name,
      totalJobs: count(jobs.id),
      completedJobs: sql<number>`COUNT(CASE WHEN ${jobs.status} = 'complete' THEN 1 END)`
    })
    .from(agents)
    .leftJoin(jobs, and(eq(jobs.assignedAgentId, agents.id), eq(jobs.companyId, companyId)))
    .where(eq(agents.companyId, companyId))
    .groupBy(agents.id, agents.name)
    .orderBy(desc(sql`COUNT(CASE WHEN ${jobs.status} = 'complete' THEN 1 END)`))
    .limit(5)

  const topAgents: TopAgentMetric[] = topAgentsRaw.map((a) => {
    const total = Number(a.totalJobs || 0)
    const completed = Number(a.completedJobs || 0)
    return {
      agentId: a.agentId,
      name: a.name,
      totalJobs: total,
      completedJobs: completed,
      completionPct: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })

  return {
    jobsByStatus,
    jobsCreatedLast14Days,
    agentAvailability,
    avgCompletionTimeMinutes,
    totalJobsCount,
    totalAgentsCount,
    totalUsersCount,
    topAgents
  }
}

/**
 * Fetches personal performance analytics for the authenticated technician.
 */
export async function fetchPersonalAnalytics(
  companyId: string,
  userId: string
): Promise<PersonalAnalyticsDto> {
  const [linkedAgent] = await db
    .select()
    .from(agents)
    .where(and(eq(agents.userId, userId), eq(agents.companyId, companyId)))

  const emptyStatusMap: Record<JobStatus, number> = {
    [JobStatus.UNASSIGNED]: 0,
    [JobStatus.ASSIGNED]: 0,
    [JobStatus.EN_ROUTE]: 0,
    [JobStatus.ON_SITE]: 0,
    [JobStatus.COMPLETE]: 0,
    [JobStatus.CANCELLED]: 0
  }

  if (!linkedAgent) {
    return {
      jobsByStatus: emptyStatusMap,
      completionRate: 0,
      avgCompletionTimeMinutes: 0,
      todayJobsCount: 0,
      completedTodayCount: 0
    }
  }

  // Job status breakdown for this agent
  const statusCounts = await db
    .select({
      status: jobs.status,
      count: count()
    })
    .from(jobs)
    .where(and(eq(jobs.companyId, companyId), eq(jobs.assignedAgentId, linkedAgent.id)))
    .groupBy(jobs.status)

  const jobsByStatus = { ...emptyStatusMap }
  let totalAssigned = 0
  let completeCount = 0

  for (const row of statusCounts) {
    const statusKey = row.status as JobStatus
    const cnt = Number(row.count)
    if (statusKey in jobsByStatus) {
      jobsByStatus[statusKey] = cnt
    }
    totalAssigned += cnt
    if (statusKey === JobStatus.COMPLETE) {
      completeCount = cnt
    }
  }

  const completionRate = totalAssigned > 0 ? Math.round((completeCount / totalAssigned) * 100) : 0

  // Average completion time for agent's completed jobs
  const durationResult = await db
    .select({
      avgMinutes: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${jobs.updatedAt} - ${jobs.createdAt})) / 60), 0)`
    })
    .from(jobs)
    .where(
      and(
        eq(jobs.companyId, companyId),
        eq(jobs.assignedAgentId, linkedAgent.id),
        eq(jobs.status, JobStatus.COMPLETE),
        sql`${jobs.updatedAt} >= ${jobs.createdAt}`
      )
    )

  const avgCompletionTimeMinutes = Math.round(Number(durationResult[0]?.avgMinutes || 0))

  // Today's schedule metrics
  const todayStart = dayjs().startOf('day').toDate()
  const todayEnd = dayjs().endOf('day').toDate()

  const [todayCounts] = await db
    .select({
      todayTotal: count(),
      todayComplete: sql<number>`COUNT(CASE WHEN ${jobs.status} = 'complete' THEN 1 END)`
    })
    .from(jobs)
    .where(
      and(
        eq(jobs.companyId, companyId),
        eq(jobs.assignedAgentId, linkedAgent.id),
        or(
          and(gte(jobs.scheduledAt, todayStart), lte(jobs.scheduledAt, todayEnd)),
          and(gte(jobs.createdAt, todayStart), lte(jobs.createdAt, todayEnd))
        )
      )
    )

  return {
    jobsByStatus,
    completionRate,
    avgCompletionTimeMinutes,
    todayJobsCount: Number(todayCounts?.todayTotal || 0),
    completedTodayCount: Number(todayCounts?.todayComplete || 0)
  }
}
