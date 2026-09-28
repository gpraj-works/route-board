import { sql } from 'drizzle-orm'
import { index, pgEnum, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from './common'
import { companyId } from './company'
import { auditUserFields } from './audit'

export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'staff', 'agent'])
export const userStatusEnum = pgEnum('user_status', ['active', 'deactivated'])

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: companyId(),
    email: text('email').notNull().unique(),
    name: text('name'),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').default('agent').notNull(),
    status: userStatusEnum('status').default('active').notNull(),
    ...timestamps(),
    ...auditUserFields()
  },
  (table) => [
    index('users_company_id_idx').on(table.companyId),
    uniqueIndex('users_company_id_owner_unique_idx')
      .on(table.companyId)
      .where(sql`role = 'owner'`)
  ]
)
