import z from 'zod'

// uploadUrl schema
export const uploadUrlSchema = z.object({
  name: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename is too long!')
    .trim(),
  mimeType: z.string(),
  size: z.number().min(1, 'Size must be > 0'),
  folderId: z.uuid().nullable().optional(),
})

// confirm upload schema
export const confirmFileUploadSchema = z.object({
  fileId: z.uuid('Invalid fileId format'),
  size: z.number(),
})
