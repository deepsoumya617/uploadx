import { Router } from 'express'
import {
  googleAuth,
  googleAuthCallback,
  logOutUser,
  refreshAccessToken,
} from '@modules/auth/auth.controller'
import { asyncHandler } from '@middleware/asyncHandler'

const authRouter = Router()

// routes
authRouter.get('/google', asyncHandler(googleAuth))
authRouter.get('/google/callback', asyncHandler(googleAuthCallback))
authRouter.get('/refresh', refreshAccessToken)
authRouter.get('/logout', logOutUser)

export default authRouter
