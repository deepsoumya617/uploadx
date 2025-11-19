// type for creating upload url
export type createUploadUrlType = {
  name: string
  size: number
  mimeType: string
  folderId: string | null
  userId: string
}

// type for confirming upload
export type confirmFileUploadType = {
  userId: string
  fileId: string
  size: number
}
