import { Redis } from 'ioredis'
require('dotenv').config()
import ErrorHandler from './errorHandler'
import logger from '../config/logger'
import httpStatus from 'http-status'

const redisClient = () => {
  if (process.env.REDIS_URL) {
    logger.info('Redis connected')
    return process.env.REDIS_URL
  }

  throw new ErrorHandler(
    'Redis not connected ',
    httpStatus.INTERNAL_SERVER_ERROR
  )
}
export const redis = new Redis(redisClient())

// export const redis = new Redis(
//   'rediss://default:AWKGAAIjcDExZDYzNzA4MWI5ZjE0YmM1YTIwNmQ0YzVjMDg2YWM5M3AxMA@grown-tetra-25222.upstash.io:6379'
// )
