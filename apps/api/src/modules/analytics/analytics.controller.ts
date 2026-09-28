import { Request, RequestHandler, Response } from 'express'
import * as analyticsService from './analytics.service'
import { asyncHandler } from '../../middleware/error-handler'
import { sendSuccess } from '../../common/response-handler'
import { UnauthorizedError } from '../../common/app-error'

/**
 * Controller for GET /api/analytics/summary
 */
export const getAnalyticsSummary: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.auth) throw new UnauthorizedError()
    const companyId = req.auth.companyId
    const summary = await analyticsService.getCompanyAnalyticsSummary(companyId)
    sendSuccess(res, summary)
  }
)

/**
 * Controller for GET /api/analytics/me
 */
export const getPersonalAnalytics: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.auth) throw new UnauthorizedError()
    const companyId = req.auth.companyId
    const userId = req.auth.userId
    const analytics = await analyticsService.getPersonalAnalytics(companyId, userId)
    sendSuccess(res, analytics)
  }
)
