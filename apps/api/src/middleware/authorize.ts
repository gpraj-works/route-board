import { NextFunction, Request, Response } from 'express'
import { Permission, roleHasAnyPermission, UserRole } from '@whosonsite/shared'
import { sendError } from '../common/response-handler'
import { HttpStatus } from '../common/http-status'
import { ErrorMessages } from '../common/error-messages'

/**
 * Enforces role-based permissions using the shared permission matrix.
 * Allows access if the caller's role possesses ANY of the specified permissions.
 */
export function requirePermission(...permissions: (Permission | Permission[])[]) {
  const allowedPermissions = permissions.flat()

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      sendError(res, ErrorMessages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
      return
    }

    if (!roleHasAnyPermission(req.auth.role, allowedPermissions)) {
      sendError(res, ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN, {
        requiredPermissions: allowedPermissions,
        userRole: req.auth.role
      })
      return
    }

    next()
  }
}

/**
 * Enforces user role directly (retained for backward compatibility).
 */
export function authorize(...roles: (UserRole | UserRole[])[]) {
  const allowedRoles = roles.flat()

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      sendError(res, ErrorMessages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
      return
    }

    if (!allowedRoles.includes(req.auth.role)) {
      sendError(res, ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN, {
        requiredRoles: allowedRoles,
        userRole: req.auth.role
      })
      return
    }

    next()
  }
}
