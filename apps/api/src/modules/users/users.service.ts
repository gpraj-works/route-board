import argon2 from 'argon2'
import {
  CreateUserInput,
  UpdateUserInput,
  UserDto,
  UserFilterQuery,
  UserRole,
  UserStatus
} from '@whosonsite/shared'
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError
} from '../../common/app-error'
import { withTransaction, DatabaseClient, db } from '../../infrastructure/database/client'
import * as usersRepo from './users.repository'

/**
 * Lists users within the authenticated company scope.
 */
export async function listUsers(
  companyId: string,
  filters: UserFilterQuery,
  client: DatabaseClient = db
): Promise<UserDto[]> {
  return usersRepo.findCompanyUsers(companyId, filters, client)
}

/**
 * Retrieves a single user by ID within the company.
 */
export async function getUserById(
  companyId: string,
  userId: string,
  client: DatabaseClient = db
): Promise<UserDto> {
  const user = await usersRepo.findUserById(companyId, userId, client)
  if (!user) {
    throw new NotFoundError('User not found')
  }
  return user
}

/**
 * Creates a new company user enforcing RBAC and uniqueness constraints.
 */
export async function createUser(
  companyId: string,
  caller: { userId: string; role: UserRole },
  input: CreateUserInput,
  client: DatabaseClient = db
): Promise<UserDto> {
  // Admins cannot create owners
  if (caller.role === UserRole.ADMIN && input.role === UserRole.OWNER) {
    throw new ForbiddenError('Admins cannot create owner accounts')
  }

  // Exactly one owner per company rule
  if (input.role === UserRole.OWNER) {
    throw new ForbiddenError(
      'Only one owner allowed per company. Use transfer ownership to assign a new owner.'
    )
  }

  // Check email uniqueness within tenant
  const existingUser = await usersRepo.findUserByEmail(companyId, input.email, client)
  if (existingUser) {
    throw new ConflictError('A user with this email already exists in this company')
  }

  const passwordToHash = input.password || 'password123'
  const passwordHash = await argon2.hash(passwordToHash)

  return usersRepo.createUser(
    {
      companyId,
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
      createdBy: caller.userId
    },
    client
  )
}

/**
 * Updates an existing user enforcing D2 single-owner transfer and D3 admin hierarchy.
 */
export async function updateUser(
  companyId: string,
  caller: { userId: string; role: UserRole },
  targetUserId: string,
  input: UpdateUserInput,
  client: DatabaseClient = db
): Promise<UserDto> {
  const targetUser = await usersRepo.findUserById(companyId, targetUserId, client)
  if (!targetUser) {
    throw new NotFoundError('User not found')
  }

  // Prevent self-deactivation
  if (caller.userId === targetUserId && input.status === UserStatus.DEACTIVATED) {
    throw new BadRequestError('You cannot deactivate your own account')
  }

  // Admin hierarchy guards
  if (caller.role === UserRole.ADMIN) {
    if (targetUser.role === UserRole.OWNER) {
      throw new ForbiddenError('Admins cannot modify the owner account')
    }
    if (input.role === UserRole.OWNER) {
      throw new ForbiddenError('Admins cannot assign the owner role')
    }
  }

  // Owner specific guards & ownership transfer
  if (caller.role === UserRole.OWNER) {
    // Owner cannot deactivate the active owner account
    if (targetUser.id === caller.userId && input.status === UserStatus.DEACTIVATED) {
      throw new BadRequestError('The active owner account cannot be deactivated')
    }

    // Owner cannot directly demote themselves without transferring ownership
    if (targetUser.id === caller.userId && input.role && input.role !== UserRole.OWNER) {
      throw new BadRequestError(
        'Owner cannot demote themselves directly. Promote another member to owner to transfer ownership.'
      )
    }

    // Ownership transfer execution
    if (targetUser.id !== caller.userId && input.role === UserRole.OWNER) {
      return withTransaction(async (tx) => {
        // Demote current owner to admin
        await usersRepo.updateUser(companyId, caller.userId, { role: UserRole.ADMIN }, tx)

        // Promote target member to owner
        const updated = await usersRepo.updateUser(companyId, targetUserId, input, tx)

        if (!updated) {
          throw new NotFoundError('User not found')
        }

        return updated
      })
    }
  }

  // Standard update
  const updated = await usersRepo.updateUser(companyId, targetUserId, input, client)
  if (!updated) {
    throw new NotFoundError('User not found')
  }

  return updated
}
