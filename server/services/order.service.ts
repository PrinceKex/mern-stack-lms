import { NextFunction, Response } from 'express'
import { catchAsyncError } from '../utils/catchAsyncErrors'
import OrderModel from '../models/order.Model'

// create new order
export const newOrder = catchAsyncError(
  async (data: any, res: Response, next: NextFunction) => {
    const order = await OrderModel.create(data)
    //next(order)

    res.status(200).json({
      success: true,
      order,
    })
  }
)

// get all orders
export const getAllOrdersService = async (res: Response) => {
  const orders = await OrderModel.find().sort({ createdAt: -1 })
  res.status(200).json({
    success: true,
    orders,
  })
}
