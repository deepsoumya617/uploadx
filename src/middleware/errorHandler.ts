import { NextFunction, Request, Response } from 'express'
import { logger } from '@config/logger'
import { errorResponse } from '@utils/response'
import { AppError } from '@errors/AppError'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // log the error
  logger.error(`[${req.method}] ${req.originalUrl} - ${String(err)}`)

  // known error
  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode, err.details)
  }

  // unknown error
  return errorResponse(res, 'Internal server error', 500)
}
