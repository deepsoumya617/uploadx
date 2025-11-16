// type for creating folders
export type createFolderType = {
  name: string
  userId: string
  parentId: string | null
}

// type for listing folders and files
export type listFolderType = {
  userId: string
  folderId: string | null
}

// type for renaming a folder
export type renameFolderType = {
  userId: string
  folderId: string
  newName: string
}

// folder/subfolder type
export type folderType = {
  id: string
  name: string
  userId: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
}

// file type
export type fileType = {
  id: string
  name: string
  userId: string
  folderId: string | null
  size: number
  mimeType: string | null
  storageKey: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: Date
  updatedAt: Date
}
