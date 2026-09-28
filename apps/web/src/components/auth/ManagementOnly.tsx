import React from 'react'
import { Permission } from '@whosonsite/shared'
import { RequirePermission } from './RequirePermission'

interface ManagementOnlyProps {
  children: React.ReactNode
}

/**
 * Route protection wrapper allowing only management users with analytics view permissions.
 */
export const ManagementOnly: React.FC<ManagementOnlyProps> = ({ children }) => {
  return <RequirePermission permission={Permission.ANALYTICS_VIEW}>{children}</RequirePermission>
}
