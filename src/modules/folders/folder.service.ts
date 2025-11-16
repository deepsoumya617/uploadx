import { db } from '@config/db'
import { files, folders } from '@db/index'
import { NotFoundError } from '@errors/NotFoundError'
import {
  createFolderType,
  fileType,
  folderType,
  listFolderType,
  renameFolderType,
} from '@modules/folders/folder.types'
import { and, eq, isNull } from 'drizzle-orm'

// create folder service
export async function handleCreateFolder({
  name,
  userId,
  parentId,
}: createFolderType) {
  // validate the parentId first
  // parentId => parent folder id
  if (parentId) {
    // check if it exists and belongs to the current user
    const [parent] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, parentId), eq(folders.userId, userId)))

    if (!parent) {
      throw new NotFoundError('Parent folder not found')
    }
  }

  // create the folder
  const [folder] = await db
    .insert(folders)
    .values({
      name,
      userId,
      parentId,
    })
    .returning()

  return folder
}

// list folder service
export async function handleListFolder({ userId, folderId }: listFolderType) {
  // list the subfolders first
  // subfolders' parentId = current folderId
  // if current folderid is null => parentId is null, [root]

  // fetch the subfolders in root level
  let subfolders: folderType[]

  if (folderId === null) {
    subfolders = await db
      .select()
      .from(folders)
      .where(and(eq(folders.userId, userId), isNull(folders.parentId)))
  } else {
    // inside other folders
    subfolders = await db
      .select()
      .from(folders)
      .where(and(eq(folders.userId, userId), eq(folders.parentId, folderId)))
  }

  // fetch the files
  let folderFiles: fileType[]

  if (folderId === null) {
    folderFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), isNull(files.folderId)))
  } else {
    folderFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.folderId, folderId)))
  }

  return { folders: subfolders, files: folderFiles }
}

// rename folder service
export async function handleRenameFolder({
  userId,
  folderId,
  newName,
}: renameFolderType): Promise<void> {
  // find the folderId first, i mean to see if it exists
  const [folder] = await db
    .select()
    .from(folders)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))

  if (!folder) {
    throw new NotFoundError('Folder not found in db')
  }

  // change the name
  await db
    .update(folders)
    .set({ name: newName, updatedAt: new Date() })
    .where(eq(folders.id, folder.id))
}
