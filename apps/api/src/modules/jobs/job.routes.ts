import { Router } from 'express'
import { Permission } from '@whosonsite/shared'
import { authenticate } from '../../middleware/authenticate'
import { requirePermission } from '../../middleware/authorize'
import { companyContext } from '../../middleware/company'
import {
  assignJobController,
  createJobController,
  deleteJobController,
  getJobByIdController,
  getJobHistoryController,
  listJobsController,
  unassignJobController,
  updateJobController,
  updateJobStatusController
} from './job.controller'

const router: Router = Router()

// All job endpoints require authentication & company context scope
router.use(authenticate, companyContext)

// Job CRUD & Listing
router.post('/', requirePermission(Permission.JOBS_CREATE), createJobController)

router.get(
  '/',
  requirePermission(Permission.JOBS_VIEW_ALL, Permission.JOBS_VIEW_OWN),
  listJobsController
)

router.get(
  '/:id',
  requirePermission(Permission.JOBS_VIEW_ALL, Permission.JOBS_VIEW_OWN),
  getJobByIdController
)

router.patch('/:id', requirePermission(Permission.JOBS_UPDATE), updateJobController)

router.delete('/:id', requirePermission(Permission.JOBS_DELETE), deleteJobController)

// Agent Assignments
router.post('/:id/assign', requirePermission(Permission.JOBS_ASSIGN), assignJobController)

router.post('/:id/unassign', requirePermission(Permission.JOBS_ASSIGN), unassignJobController)

// Status Transitions & Audit History
router.post(
  '/:id/status',
  requirePermission(Permission.JOBS_STATUS_UPDATE),
  updateJobStatusController
)

router.get(
  '/:id/status-history',
  requirePermission(Permission.JOBS_HISTORY_VIEW),
  getJobHistoryController
)

export default router
