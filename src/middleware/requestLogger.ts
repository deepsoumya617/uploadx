import { logger } from '@config/logger'
import { NextFunction, Request, Response } from 'express'

export function requestMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`

    if (res.statusCode >= 500) logger.error(logMessage)
    else if (res.statusCode >= 400) logger.warn(logMessage)
    else logger.info(logMessage)
  })

  next()
}
