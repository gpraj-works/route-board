import { CreateUserInput, UpdateUserInput, UserDto, UserFilterQuery } from '@whosonsite/shared'
import { apiClient } from '../../lib/api'

/**
 * Fetches company users matching optional filters.
 */
export async function listUsers(filters?: UserFilterQuery): Promise<UserDto[]> {
  const params = new URLSearchParams()
  if (filters?.role) params.set('role', filters.role)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.search) params.set('search', filters.search)

  const queryString = params.toString() ? `?${params.toString()}` : ''
  return apiClient<UserDto[]>(`/users${queryString}`)
}

/**
 * Retrieves a single user by ID.
 */
export async function getUserById(id: string): Promise<UserDto> {
  return apiClient<UserDto>(`/users/${id}`)
}

/**
 * Creates a new company member.
 */
export async function createUser(input: CreateUserInput): Promise<UserDto> {
  return apiClient<UserDto>('/users', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

/**
 * Updates a company member's role, status, or name.
 */
export async function updateUser(id: string, input: UpdateUserInput): Promise<UserDto> {
  return apiClient<UserDto>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  })
}
