import { db } from '@config/db'
import {
  confirmFileUploadType,
  createUploadUrlType,
} from '@modules/files/file.types'
import { files, folders, users } from '@db/index'
import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '@errors/NotFoundError'
import { ForbiddenError } from '@errors/ForbiddenError'
import { generateStorageKey } from '@utils/generateStorageKey'
import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '@config/env'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3 } from '@config/s3'
import { BadRequestError } from '@errors/BadRequestError'

// create upload url and return to the controller
export async function handleCreateUploadUrl({
  name,
  size,
  mimeType,
  folderId,
  userId,
}: createUploadUrlType) {
  // so, if the folderId is not null, we have to check the ownership
  if (folderId !== null) {
    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))

    if (!folder) {
      throw new NotFoundError('Folder not found!')
    }
  }

  // check storage quota for the user
  const [user] = await db.select().from(users).where(eq(users.id, userId))

  if (!user) {
    throw new NotFoundError('User not found.')
  }

  if (user.totalStorageUsed + size > user.storageLimit) {
    throw new ForbiddenError('Not enough storage.')
  }

  // add new entry in db
  const [file] = await db
    .insert(files)
    .values({
      name,
      size: 0,
      mimeType,
      folderId,
      userId,
      storageKey: '', // keep empty for this moment
      status: 'PENDING',
    })
    .returning()

  const fileId = file.id
  const fileName = name

  // generate the storage key
  const storageKey = generateStorageKey({ userId, fileId, fileName, folderId })

  // update the storagekey
  await db.update(files).set({ storageKey }).where(eq(files.id, file.id))

  // create the url
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: storageKey,
    ContentType: mimeType,
  })

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 900,
  })

  return { uploadUrl, fileId, storageKey }
}

// now confirm the S3 obj exists in bucket and matches expected size
// if so, then => 'COMPLETED' and update user.totalStorageUsed
// else, 'FAILED' and throw error
export async function handleConfirmFileUpload({
  userId,
  fileId,
  size,
}: confirmFileUploadType) {
  // check if file exists
  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.id, fileId), eq(files.userId, userId)))

  if (!file) {
    throw new NotFoundError('File not found in db')
  }

  const storageKey = file.storageKey

  // call HeadObject on S3 to get actual uploaded size
  let head
  try {
    head = await s3.send(
      new HeadObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: storageKey,
      })
    )
  } catch (error) {
    // object doesnt exist => fail
    await db.update(files).set({ status: 'FAILED' }).where(eq(files.id, fileId))
    throw new NotFoundError('File doesnt exist in S3')
  }

  // compare size now
  const actualSize = head.ContentLength ?? 0

  if (size !== actualSize) {
    // size mismatch
    await db.update(files).set({ status: 'FAILED' }).where(eq(files.id, fileId))
    throw new BadRequestError('Uploaded file size mismatch')
  }

  // update the status in db
  await db
    .update(files)
    .set({ status: 'COMPLETED', size: actualSize, updatedAt: new Date() })
    .where(eq(files.id, fileId))

  // update totalStorageUsed
  const [user] = await db.select().from(users).where(eq(users.id, userId))

  if (!user) {
    throw new NotFoundError('User doesnt exist')
  }

  const newTotal = user.totalStorageUsed + actualSize

  await db
    .update(users)
    .set({ totalStorageUsed: newTotal })
    .where(eq(users.id, userId))
}
