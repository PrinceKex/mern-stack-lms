import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '../utils/errorHandler'
import { catchAsyncError } from '../utils/catchAsyncErrors'
import { generateLast12MonthsData } from '../utils/analytics.generator'
import userModel from '../models/user.model'
import CourseModel from '../models/course.model'
import OrderModel from '../models/order.Model'

// get users analytics -- only admin
export const getUsersAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MonthsData(userModel)

      res.status(200).json({
        success: true,
        message: 'User Analytics',
        users,
      })
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500))
    }
  }
)

// get courses analytics -- only admin
export const getCoursesAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await generateLast12MonthsData(CourseModel)

      res.status(200).json({
        success: true,
        message: 'Course Analytics',
        courses,
      })
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500))
    }
  }
)

// get courses analytics -- only admin
export const getOrdersAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await generateLast12MonthsData(OrderModel)

      res.status(200).json({
        success: true,
        message: 'Order Analytics',
        orders,
      })
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500))
    }
  }
)
