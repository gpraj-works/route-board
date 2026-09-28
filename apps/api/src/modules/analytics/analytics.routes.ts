import { Router } from 'express'
import { Permission } from '@whosonsite/shared'
import { authenticate } from '../../middleware/authenticate'
import { companyContext } from '../../middleware/company'
import { requirePermission } from '../../middleware/authorize'
import * as analyticsController from './analytics.controller'

const router = Router()

// Protect all analytics endpoints with auth, company context, and permission authorization
router.use(authenticate, companyContext)

router.get(
  '/summary',
  requirePermission(Permission.ANALYTICS_VIEW),
  analyticsController.getAnalyticsSummary
)

router.get(
  '/me',
  requirePermission(Permission.ANALYTICS_VIEW_PERSONAL),
  analyticsController.getPersonalAnalytics
)

export const analyticsRouter: Router = router
