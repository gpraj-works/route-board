import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { Permission } from '@whosonsite/shared'
import { authenticate } from '../../middleware/authenticate'
import { requirePermission } from '../../middleware/authorize'
import { companyContext } from '../../middleware/company'
import * as subscriptionController from './subscription.controller'

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many checkout requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
})

const router = Router()

// Payment provider pushes webhooks without an authenticated session
router.post('/webhook', subscriptionController.webhook)

router.use(authenticate, companyContext)

router.get('/status', subscriptionController.getStatus)
router.post(
  '/checkout',
  checkoutLimiter,
  requirePermission(Permission.BILLING_MANAGE),
  subscriptionController.checkout
)
router.post(
  '/checkout/confirm',
  checkoutLimiter,
  requirePermission(Permission.BILLING_MANAGE),
  subscriptionController.confirmCheckout
)
router.put('/cancel', requirePermission(Permission.BILLING_MANAGE), subscriptionController.cancel)

export const subscriptionRouter: Router = router