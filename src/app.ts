import { errorHandler } from '@middleware/errorHandler'
import { requestMiddleware } from '@middleware/requestLogger'
import express, { Express } from 'express'

const app: Express = express()

// builtin middlewares
app.use(express.json())

// request logger
app.use(requestMiddleware)

// routes....

app.use(errorHandler)

export default app
