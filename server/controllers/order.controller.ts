import { NextFunction, Request, Response } from 'express'
import { catchAsyncError } from '../utils/catchAsyncErrors'
import ErrorHandler from '../utils/errorHandler'
import { IOrder } from '../models/order.Model'
import userModel from '../models/user.model'
import CourseModel from '../models/course.model'
import { getAllOrdersService, newOrder } from '../services/order.service'
import ejs from 'ejs'
import path from 'path'
import sendMail from '../utils/sendMail'
import NotificationModel from '../models/notification.Model'
import { ICourse } from '../types/courseTypes'

// create order
export const createOrder = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder
      const user = await userModel.findById(req.user?._id)

      const courseExistInUser = user?.courses.some(
        (course: any) => course._id.toString() === courseId
      )
      if (courseExistInUser) {
        return next(
          new ErrorHandler('You have already purchased the course', 400)
        )
      }

      const course: ICourse | null = await CourseModel.findById(courseId)
      if (!course) {
        return next(new ErrorHandler('Course not found', 404))
      }

      const data: any = {
        courseId: course._id,
        userId: user?._id,
        payment_info,
      }

      // moved to function end using the order.service.ts
      // newOrder(data, res, next)

      // added courseid to mange course._id ish
      const courseid = course._id as any

      const mailData: any = {
        order: {
          _id: courseid.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      }
      const html = await ejs.renderFile(
        path.join(__dirname, '../mails/order-confirmation.ejs'),
        { order: mailData }
      )

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: 'Order Confirmation',
            template: 'order-confirmation.ejs',
            data: mailData,
          })
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
      }
      user?.courses.push(courseid)
      await user?.save()

      await NotificationModel.create({
        user: user?._id,
        title: 'New Order',
        message: `You have a new order from ${course.name}`,
      })

      course.purchased ? (course.purchased += 1) : course.purchased
      await course.save()

      newOrder(data, res, next)

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: course,
      })
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500))
    }
  }
)

// get all orders -- only for admin
export const getAllOrders = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllOrdersService(res)
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500))
    }
  }
)
