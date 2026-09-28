import { Router } from 'express'
import { Permission } from '@whosonsite/shared'
import { authenticate } from '../../middleware/authenticate'
import { companyContext } from '../../middleware/company'
import { requirePermission } from '../../middleware/authorize'
import * as agentController from './agent.controller'

const router = Router()

// Apply authentication and company context middleware across all agent routes
router.use(authenticate, companyContext)

router.get('/', requirePermission(Permission.AGENTS_VIEW), agentController.listAgents)

router.get('/nearby', requirePermission(Permission.AGENTS_VIEW), agentController.nearbyAgents)

router.post('/', requirePermission(Permission.AGENTS_CREATE), agentController.createAgent)

router.patch(
  '/:id/location',
  requirePermission(Permission.AGENTS_UPDATE, Permission.JOBS_STATUS_UPDATE),
  agentController.updateLocation
)

router.patch('/:id', requirePermission(Permission.AGENTS_UPDATE), agentController.updateAgent)

router.delete('/:id', requirePermission(Permission.AGENTS_DELETE), agentController.deleteAgent)

export const agentRouter: Router = router
