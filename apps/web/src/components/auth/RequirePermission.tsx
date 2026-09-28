import React from 'react'
import { Navigate } from 'react-router-dom'
import { Permission, roleHasAnyPermission, roleHasPermission } from '@whosonsite/shared'
import { LoadingState } from '../common/LoadingState'
import { useAuth } from './AuthContext'

/**
 * Hook to check if the current authenticated user has a specific permission or any of a set of permissions.
 */
export function useCan(permission: Permission | readonly Permission[]): boolean {
  const { user } = useAuth()
  if (!user || !user.role) {
    return false
  }

  if (Array.isArray(permission)) {
    return roleHasAnyPermission(user.role, permission)
  }

  return roleHasPermission(user.role, permission as Permission)
}

interface CanProps {
  do: Permission | readonly Permission[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component for conditionally rendering UI blocks based on user permissions.
 */
export const Can: React.FC<CanProps> = ({ do: perm, children, fallback = null }) => {
  const allowed = useCan(perm)
  return <>{allowed ? children : fallback}</>
}

interface RequirePermissionProps {
  permission: Permission | readonly Permission[]
  children: React.ReactNode
}

/**
 * Route protection wrapper requiring the user to hold specific permissions.
 * Redirects unauthorized users to /dashboard.
 */
export const RequirePermission: React.FC<RequirePermissionProps> = ({ permission, children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const hasAccess = useCan(permission)

  if (isLoading) {
    return <LoadingState message="Verifying permissions..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
