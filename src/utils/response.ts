import { Response } from 'express'

// success response
export function successResponse(
  res: Response,
  data: any,
  message = 'success',
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

// error response
export function errorResponse(
  res: Response,
  message: string,
  statusCode: number,
  details?: string[]
) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  })
}
