require('dotenv').config()
import { Request, Response, NextFunction } from 'express'
import { catchAsyncError } from '../utils/catchAsyncErrors'
import ErrorHandler from '../utils/errorHandler'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { redis } from '../utils/redis'

// check authenticated
export const isAuthenticated = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string
    if (!access_token) {
      return next(new ErrorHandler('Please login to access this resource', 401))
    }

    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload
    if (!decoded) {
      return next(new ErrorHandler('access token is invalid', 401))
    }

    const user = await redis.get(decoded.id)
    if (!user) {
      return next(new ErrorHandler('Please login to access this resource', 401))
    }

    req.user = JSON.parse(user)
    next()
  }
)

// validate user role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || '')) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          403
        )
      )
    }
    next()
  }
}
