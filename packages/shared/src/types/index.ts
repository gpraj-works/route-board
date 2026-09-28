import { AgentStatus, JobStatus, UserRole, UserStatus } from '../enums/index'
import { Coordinates } from '../schemas/index'

export interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
}

export interface ReadinessResponse {
  status: 'ready' | 'not_ready'
  services: {
    postgres: boolean
    redis: boolean
  }
  timestamp: string
}

export interface JwtPayload {
  userId: string
  companyId: string
  role: UserRole
}

export interface CompanyDto {
  id: string
  name: string
  primaryColor: string
  email?: string | null
  phone?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  createdAt: string
  updatedAt: string
}

export interface CustomerDto {
  id: string
  companyId: string
  name: string
  email: string | null
  mobile: string
  address: string
  latitude: number | null
  longitude: number | null
  additionalInfo: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface AuthUser {
  id: string
  companyId: string
  email: string
  name?: string | null
  role: UserRole
  status?: UserStatus
  createdAt: string
}

export interface UserDto {
  id: string
  companyId: string
  email: string
  name: string | null
  role: UserRole
  status: UserStatus
  agentLinked: boolean
  agentId?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  email: string
  name?: string
  password?: string
  role: UserRole
}

export interface UpdateUserRequest {
  name?: string
  role?: UserRole
  status?: UserStatus
}

export interface UserQueryRequest {
  role?: UserRole
  status?: UserStatus
  search?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
  company?: CompanyDto
}

export interface RegisterRequest {
  companyName: string
  email: string
  phone: string
  password: string
  address: string
  latitude?: number | null
  longitude?: number | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface JobDto {
  id: string
  shareToken: string
  companyId: string
  customerId: string
  customer: CustomerDto | null
  location: Coordinates | null
  status: JobStatus
  scheduledAt: string | null
  assignedAgentId: string | null
  assignedAgentName: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface JobStatusHistoryDto {
  id: string
  companyId: string
  jobId: string
  fromStatus: JobStatus | null
  toStatus: JobStatus
  changedBy: string | null
  changedByName: string | null
  changedAt: string
  note: string | null
}

export interface CustomerStatusHistoryDto {
  toStatus: JobStatus
  changedAt: string
  note: string | null
}

export interface CustomerStatusDto {
  jobId: string
  companyName: string
  companyPrimaryColor: string
  status: JobStatus
  customerName: string
  agentName: string | null
  scheduledAt: string | null
  updatedAt: string
  notes: string | null
  history: CustomerStatusHistoryDto[]
}

export interface AgentDto {
  id: string
  companyId: string
  userId: string
  name: string
  phone: string
  status: AgentStatus
  location: Coordinates | null
  lastLocationAt: string | null
  distanceMeters?: number
}

export interface DailyJobCount {
  date: string
  count: number
}

export interface TopAgentMetric {
  agentId: string
  name: string
  completedJobs: number
  totalJobs: number
  completionPct: number
}

export interface AnalyticsSummaryDto {
  jobsByStatus: Record<JobStatus, number>
  jobsCreatedLast14Days: DailyJobCount[]
  agentAvailability: Record<AgentStatus, number>
  avgCompletionTimeMinutes: number
  totalJobsCount: number
  totalAgentsCount: number
  totalUsersCount: number
  topAgents: TopAgentMetric[]
}

export interface PersonalAnalyticsDto {
  jobsByStatus: Record<JobStatus, number>
  completionRate: number
  avgCompletionTimeMinutes: number
  todayJobsCount: number
  completedTodayCount: number
}
