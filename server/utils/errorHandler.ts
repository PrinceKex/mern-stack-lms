class ErrorHandler extends Error {
  constructor(public message: string, public statusCode: number) {
    super()
    this.statusCode = statusCode
    this.message = message

    Error.captureStackTrace(this, this.constructor)
  }
}
export default ErrorHandler
