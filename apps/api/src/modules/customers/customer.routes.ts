import { Router } from 'express'
import { Permission } from '@whosonsite/shared'
import { authenticate } from '../../middleware/authenticate'
import { requirePermission } from '../../middleware/authorize'
import { companyContext } from '../../middleware/company'
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer
} from './customer.controller'

const router = Router()

// All customer endpoints require authentication & company context scope
router.use(authenticate, companyContext)

router.get('/', requirePermission(Permission.CUSTOMERS_VIEW), listCustomers)

router.get('/:id', requirePermission(Permission.CUSTOMERS_VIEW), getCustomerById)

router.post('/', requirePermission(Permission.CUSTOMERS_CREATE), createCustomer)

router.patch('/:id', requirePermission(Permission.CUSTOMERS_UPDATE), updateCustomer)

router.delete('/:id', requirePermission(Permission.CUSTOMERS_DELETE), deleteCustomer)

export const customerRouter: Router = router
