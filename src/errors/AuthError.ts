import { AppError } from './AppError'

export class AuthError extends AppError {
  constructor(message = 'Authentication failed', details?: string[]) {
    super(message, 401, details)
  }
}
