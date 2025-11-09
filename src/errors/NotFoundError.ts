import { AppError } from './AppError'

export class NotFoundError extends AppError {
  constructor(message: string, details?: string[]) {
    super(message, 404, details)
  }
}
