import { NextFunction, Request, Response } from 'express'
import { SubscriptionStatus } from '@whosonsite/shared'
import { sendError } from '../common/response-handler'
import { HttpStatus } from '../common/http-status'
import { ErrorMessages } from '../common/error-messages'
import * as subscriptionRepo from '../modules/subscription/subscription.repository'
import { computeSubscriptionInfo } from '../modules/subscription/subscription.service'
import { authenticate } from './authenticate'
import { companyContext } from './company'

/**
 * Whole-app subscription gate. Blocks requests from companies whose trial has
 * expired or whose subscription is no longer active, with a checkout redirect hint.
 */
function enforceSubscription(req: Request, res: Response, next: NextFunction): void {
  subscriptionRepo
    .findCompanyById(req.auth!.companyId)
    .then((company) => {
      if (!company) {
        sendError(res, ErrorMessages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
        return
      }

      const info = computeSubscriptionInfo(company)
      if (info.requiresCheckout) {
        const isTrial = company.subscriptionStatus === SubscriptionStatus.TRIAL
        sendError(
          res,
          isTrial
            ? 'Trial expired. Please subscribe to continue using WhosOnSite.'
            : 'Subscription required. Please update your billing to continue.',
          HttpStatus.FORBIDDEN,
          { requiresCheckout: true },
          isTrial ? 'TRIAL_EXPIRED' : 'SUBSCRIPTION_REQUIRED'
        )
        return
      }

      next()
    })
    .catch(next)
}

export const requireActiveSubscription = [
  authenticate,
  companyContext,
  enforceSubscription
]