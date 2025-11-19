import { asyncHandler } from '@middleware/asyncHandler'
import { authMiddleware } from '@middleware/authMiddleware'
import { Router } from 'express'
import {
  confirmFileUpload,
  createUploadUrl,
} from '@modules/files/file.controller'

const fileRouter = Router()

// auth middleware
fileRouter.use(authMiddleware)

// routes

// single upload
fileRouter.post('/upload-url', asyncHandler(createUploadUrl))
fileRouter.post('/confirm-upload', asyncHandler(confirmFileUpload))

// multi-part upload

export default fileRouter
