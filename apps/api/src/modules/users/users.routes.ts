import { Router } from 'express'
import { Permission } from '@whosonsite/shared'
import { authenticate } from '../../middleware/authenticate'
import { requirePermission } from '../../middleware/authorize'
import { companyContext } from '../../middleware/company'
import {
  createUserController,
  getUserByIdController,
  listUsersController,
  updateUserController
} from './users.controller'

const router = Router()

// All user management endpoints require authentication & company context scope
router.use(authenticate, companyContext)

router.get('/', requirePermission(Permission.USERS_VIEW), listUsersController)
router.get('/:id', requirePermission(Permission.USERS_VIEW), getUserByIdController)
router.post('/', requirePermission(Permission.USERS_CREATE), createUserController)
router.patch('/:id', requirePermission(Permission.USERS_UPDATE), updateUserController)

export const usersRouter: Router = router
