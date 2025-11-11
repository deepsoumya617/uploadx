import { db } from '@config/db'
import { users } from '@db/index'
import { AuthError } from '@errors/AuthError'
import { NotFoundError } from '@errors/NotFoundError'
import { verifyToken } from '@utils/token'
import { eq } from 'drizzle-orm'
import { NextFunction, Request, Response } from 'express'

// extend Request to bind userId
export interface AuthRequest extends Request {
  user?: { userId: string }
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // extract the token from authorization header and verify
  const token = req.headers.authorization?.split('')[1]

  if (!token) {
    throw new AuthError('Access denied. No token provided.', 401)
  }

  // decode the token, extract userId
  const decodedToken = verifyToken<{ userId: string }>(token)
  const { userId } = decodedToken

  // find the user in db
  const [user] = await db.select().from(users).where(eq(users.id, userId))

  // no user found
  if (!user) {
    throw new NotFoundError('User does not exist!')
  }

  // bind userId with req.user
  req.user = { userId }
  next()
}
