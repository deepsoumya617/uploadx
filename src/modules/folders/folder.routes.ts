import { authMiddleware } from '@middleware/authMiddleware'
import { Router } from 'express'
import { createFolder, listFolder, renameFolder } from '@modules/folders/folder.controller'

// folder routes
const folderRouter = Router()

folderRouter.use(authMiddleware)

// routes go here..
folderRouter.post('/create', createFolder)
folderRouter.get('/:folderId?', listFolder)
folderRouter.patch('/:folderId', renameFolder)

export default folderRouter
