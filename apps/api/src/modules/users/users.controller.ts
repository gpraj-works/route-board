import { Request, RequestHandler, Response } from 'express'
import { createUserSchema, updateUserSchema, userFilterQuerySchema } from '@whosonsite/shared'
import { UnauthorizedError } from '../../common/app-error'
import { HttpStatus } from '../../common/http-status'
import { sendSuccess } from '../../common/response-handler'
import { asyncHandler } from '../../middleware/error-handler'
import * as usersService from './users.service'

/**
 * Controller retrieving company users list.
 */
export const listUsersController: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.auth) throw new UnauthorizedError()
    const companyId = req.auth.companyId
    const query = userFilterQuerySchema.parse(req.query)

    const users = await usersService.listUsers(companyId, query)
    return sendSuccess(res, users, 'Users retrieved successfully', HttpStatus.OK)
  }
)

/**
 * Controller retrieving a single user by ID.
 */
export const getUserByIdController: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.auth) throw new UnauthorizedError()
    const companyId = req.auth.companyId
    const id = req.params.id as string

    const user = await usersService.getUserById(companyId, id)
    return sendSuccess(res, user, 'User retrieved successfully', HttpStatus.OK)
  }
)

/**
 * Controller creating a new company user.
 */
export const createUserController: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.auth) throw new UnauthorizedError()
    const companyId = req.auth.companyId
    const caller = { userId: req.auth.userId, role: req.auth.role }
    const parsed = createUserSchema.parse(req.body)

    const user = await usersService.createUser(companyId, caller, parsed)
    return sendSuccess(res, user, 'User created successfully', HttpStatus.CREATED)
  }
)

/**
 * Controller updating an existing company user.
 */
export const updateUserController: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.auth) throw new UnauthorizedError()
    const companyId = req.auth.companyId
    const caller = { userId: req.auth.userId, role: req.auth.role }
    const id = req.params.id as string
    const parsed = updateUserSchema.parse(req.body)

    const user = await usersService.updateUser(companyId, caller, id, parsed)
    return sendSuccess(res, user, 'User updated successfully', HttpStatus.OK)
  }
)
