import { AppError } from './AppError'

export class ValidationError extends AppError {
  constructor(message = 'Invalid input data', details?: string[]) {
    super(message, 400, details)
  }
}
