export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: string[]

  constructor(message: string, statusCode: number, details?: string[]) {
    super(message)

    this.statusCode = statusCode // error code
    this.isOperational = true // expected error or not
    this.details = details // additional error details

    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this)
  }
}
