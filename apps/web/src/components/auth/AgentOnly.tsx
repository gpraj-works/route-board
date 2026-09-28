import React from 'react'
import { Permission } from '@whosonsite/shared'
import { RequirePermission } from './RequirePermission'

interface AgentOnlyProps {
  children: React.ReactNode
}

/**
 * Route protection wrapper allowing only agents with own-job viewing permissions.
 */
export const AgentOnly: React.FC<AgentOnlyProps> = ({ children }) => {
  return (
    <RequirePermission permission={[Permission.JOBS_VIEW_OWN, Permission.JOBS_VIEW_ALL]}>
      {children}
    </RequirePermission>
  )
}
