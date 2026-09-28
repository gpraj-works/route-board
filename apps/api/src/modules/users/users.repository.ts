import { and, count, desc, eq, ilike, or } from 'drizzle-orm'
import { dayjs, UserDto, UserFilterQuery, UserRole, UserStatus } from '@whosonsite/shared'
import { DatabaseClient, db } from '../../infrastructure/database/client'
import { agents, users } from '../../infrastructure/database/schema/index'

export interface CreateUserData {
  companyId: string
  email: string
  name?: string | null
  passwordHash: string
  role: UserRole
  createdBy?: string | null
}

export interface UpdateUserData {
  name?: string
  role?: UserRole
  status?: UserStatus
}

/**
 * Fetches company users matching optional filters, with linked agent info.
 */
export async function findCompanyUsers(
  companyId: string,
  filters: UserFilterQuery = {},
  client: DatabaseClient = db
): Promise<UserDto[]> {
  const conditions = [eq(users.companyId, companyId)]

  if (filters.role) {
    conditions.push(eq(users.role, filters.role))
  }

  if (filters.status) {
    conditions.push(eq(users.status, filters.status))
  }

  if (filters.search) {
    const term = `%${filters.search}%`
    conditions.push(or(ilike(users.email, term), ilike(users.name, term))!)
  }

  const rows = await client
    .select({
      id: users.id,
      companyId: users.companyId,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      agentId: agents.id
    })
    .from(users)
    .leftJoin(agents, eq(agents.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(users.createdAt))

  return rows.map((r) => ({
    id: r.id,
    companyId: r.companyId,
    email: r.email,
    name: r.name,
    role: r.role as UserRole,
    status: r.status as UserStatus,
    agentLinked: Boolean(r.agentId),
    agentId: r.agentId || null,
    createdAt: dayjs(r.createdAt).toISOString(),
    updatedAt: dayjs(r.updatedAt).toISOString()
  }))
}

/**
 * Finds a single user by id within a company.
 */
export async function findUserById(
  companyId: string,
  userId: string,
  client: DatabaseClient = db
): Promise<UserDto | null> {
  const [row] = await client
    .select({
      id: users.id,
      companyId: users.companyId,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      agentId: agents.id
    })
    .from(users)
    .leftJoin(agents, eq(agents.userId, users.id))
    .where(and(eq(users.id, userId), eq(users.companyId, companyId)))

  if (!row) {
    return null
  }

  return {
    id: row.id,
    companyId: row.companyId,
    email: row.email,
    name: row.name,
    role: row.role as UserRole,
    status: row.status as UserStatus,
    agentLinked: Boolean(row.agentId),
    agentId: row.agentId || null,
    createdAt: dayjs(row.createdAt).toISOString(),
    updatedAt: dayjs(row.updatedAt).toISOString()
  }
}

/**
 * Finds a user by email within a company (for duplicate check).
 */
export async function findUserByEmail(
  companyId: string,
  email: string,
  client: DatabaseClient = db
) {
  const [row] = await client
    .select()
    .from(users)
    .where(and(eq(users.email, email.toLowerCase().trim()), eq(users.companyId, companyId)))

  return row || null
}

/**
 * Finds the current owner for a company.
 */
export async function findCompanyOwner(companyId: string, client: DatabaseClient = db) {
  const [row] = await client
    .select()
    .from(users)
    .where(and(eq(users.companyId, companyId), eq(users.role, UserRole.OWNER)))

  return row || null
}

/**
 * Creates a new user record.
 */
export async function createUser(
  data: CreateUserData,
  client: DatabaseClient = db
): Promise<UserDto> {
  const [row] = await client
    .insert(users)
    .values({
      companyId: data.companyId,
      email: data.email.toLowerCase().trim(),
      name: data.name?.trim() || null,
      passwordHash: data.passwordHash,
      role: data.role,
      status: UserStatus.ACTIVE,
      createdBy: data.createdBy || null
    })
    .returning()

  return {
    id: row.id,
    companyId: row.companyId,
    email: row.email,
    name: row.name,
    role: row.role as UserRole,
    status: row.status as UserStatus,
    agentLinked: false,
    agentId: null,
    createdAt: dayjs(row.createdAt).toISOString(),
    updatedAt: dayjs(row.updatedAt).toISOString()
  }
}

/**
 * Updates a user's details.
 */
export async function updateUser(
  companyId: string,
  userId: string,
  data: UpdateUserData,
  client: DatabaseClient = db
): Promise<UserDto | null> {
  const updatePayload: Record<string, unknown> = {
    updatedAt: dayjs().toDate()
  }

  if (data.name !== undefined) {
    updatePayload.name = data.name.trim() || null
  }

  if (data.role !== undefined) {
    updatePayload.role = data.role
  }

  if (data.status !== undefined) {
    updatePayload.status = data.status
  }

  const [row] = await client
    .update(users)
    .set(updatePayload)
    .where(and(eq(users.id, userId), eq(users.companyId, companyId)))
    .returning()

  if (!row) {
    return null
  }

  return findUserById(companyId, userId, client)
}

/**
 * Returns total count of active users in a company.
 */
export async function countCompanyUsers(
  companyId: string,
  client: DatabaseClient = db
): Promise<number> {
  const [result] = await client
    .select({ total: count() })
    .from(users)
    .where(and(eq(users.companyId, companyId), eq(users.status, UserStatus.ACTIVE)))

  return Number(result?.total || 0)
}
