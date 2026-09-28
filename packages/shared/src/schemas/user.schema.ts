import { z } from 'zod'
import { UserRole, UserStatus } from '../enums/index'

export const userRoleSchema = z.nativeEnum(UserRole)
export const userStatusSchema = z.nativeEnum(UserStatus)

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name cannot be empty').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: userRoleSchema
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional()
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const userFilterQuerySchema = z.object({
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  search: z.string().optional()
})

export type UserFilterQuery = z.infer<typeof userFilterQuerySchema>
