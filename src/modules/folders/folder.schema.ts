import z from 'zod'

// create folder schema
export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name is too long')
    .trim(),
  parentId: z.uuid('Invalid parentId format').nullable().optional(),
})

// list folder schema
export const listFolderSchema = z.object({
  folderId: z.uuid('Invalid folderId format').nullable().optional(),
})

// rename folder schemas — validate params and body separately
export const renameFolderParamsSchema = z.object({
  folderId: z.uuid('Invalid folderId format'),
})

export const renameFolderBodySchema = z.object({
  newName: z
    .string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name is too long')
    .trim(),
})

