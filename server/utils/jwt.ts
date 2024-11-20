require('dotenv').config()
import { Response } from 'express'
import { IUser } from '../types/userTypes'
import { redis } from './redis'
import { ITokenOptions } from '../types/tokenTypes'

//parse environment variables to integrate the fallback values
export const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || '300',
  10
)
export const refreshTokenExpire = parseInt(
  process.env.ACCESS_REFRESH_EXPIRE || '1200',
  10
)

//options for cookies
export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
}

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
}

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.signAccessToken()
  const refreshToken = user.signRefreshToken()

  // upload session to redis
  const userId = user._id as string
  redis.set(userId, JSON.stringify(user) as any)

  res.cookie('access_token', accessToken, accessTokenOptions)
  res.cookie('refresh_token', refreshToken, refreshTokenOptions)

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
    refreshToken,
  })
}