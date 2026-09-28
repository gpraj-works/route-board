import { Request, RequestHandler, Response } from 'express'
import { asyncHandler } from '../../middleware/error-handler'
import { sendSuccess } from '../../common/response-handler'
import { HttpStatus } from '../../common/http-status'
import * as subscriptionService from './subscription.service'

export const getStatus: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await subscriptionService.getSubscriptionStatus(req.auth!.companyId)
  sendSuccess(res, data)
})

export const checkout: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await subscriptionService.createSandboxCheckout(req.auth!.companyId)
  sendSuccess(res, data)
})

export const confirmCheckout: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await subscriptionService.confirmCheckout(req.auth!.companyId)
    sendSuccess(res, data, 'Subscription activated successfully.', HttpStatus.OK)
  }
)

export const cancel: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await subscriptionService.cancelSubscription(req.auth!.companyId)
  sendSuccess(res, data, 'Subscription cancelled.')
})

export const webhook: RequestHandler = (_req: Request, res: Response) => {
  sendSuccess(res, { received: true }, 'Webhook acknowledged.')
}