import { Router } from 'express'
import { analyticsRouter } from '../modules/analytics/analytics.routes'
import { authRouter } from '../modules/auth/auth.routes'
import { customerRouter } from '../modules/customers/customer.routes'
import jobRouter from '../modules/jobs/job.routes'
import { publicStatusRouter } from '../modules/public-status/public-status.routes'
import { agentRouter } from '../modules/agents/agent.routes'
import { usersRouter } from '../modules/users/users.routes'
import { requireActiveSubscription } from '../middleware/subscription-guard'
import { subscriptionRouter } from '../modules/subscription/subscription.routes'

const apiRouter: Router = Router()

// Public + auth + subscription routes are exempt from the whole-app subscription gate
apiRouter.use('/auth', authRouter)
apiRouter.use('/subscription', subscriptionRouter)
apiRouter.use('/public', publicStatusRouter)

// Whole-app subscription gate for all protected business routes
apiRouter.use(requireActiveSubscription)

apiRouter.use('/agents', agentRouter)
apiRouter.use('/customers', customerRouter)
apiRouter.use('/jobs', jobRouter)
apiRouter.use('/analytics', analyticsRouter)
apiRouter.use('/users', usersRouter)

export { apiRouter }
