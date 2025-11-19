import { AuthRequest } from '@middleware/authMiddleware'
import { Response } from 'express'
import {
  confirmFileUploadSchema,
  uploadUrlSchema,
} from '@modules/files/file.schema'
import { ValidationError } from '@errors/ValidationError'
import {
  handleConfirmFileUpload,
  handleCreateUploadUrl,
} from '@modules/files/file.service'
import { successResponse } from '@utils/response'

// generate upload url
export async function createUploadUrl(req: AuthRequest, res: Response) {
  const result = uploadUrlSchema.safeParse(req.body)

  if (!result.success) {
    throw new ValidationError()
  }

  const { name, size, mimeType, folderId = null } = result.data
  const userId = req.user!.userId

  // get the data from the service
  const data = await handleCreateUploadUrl({
    name,
    size,
    mimeType,
    folderId,
    userId,
  })

  return successResponse(
    res,
    { ...data },
    true,
    'Upload url created succesfully!',
    200
  )
}

// confirm file upload
export async function confirmFileUpload(req: AuthRequest, res: Response) {
  const result = confirmFileUploadSchema.safeParse(req.body)

  if (!result.success) {
    throw new ValidationError()
  }

  const { fileId, size } = result.data
  const userId = req.user!.userId

  // pass to service
  await handleConfirmFileUpload({ userId, fileId, size })

  return successResponse(res, {}, true, 'Upload confirmed', 200)
}
