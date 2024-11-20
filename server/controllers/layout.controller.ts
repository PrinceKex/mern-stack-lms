import { NextFunction, Request, Response } from 'express'
import { catchAsyncError } from '../utils/catchAsyncErrors'
import ErrorHandler from '../utils/errorHandler'
import LayoutModel from '../models/layout.model'
import cloudinary from 'cloudinary'

// create layout
export const createLayout = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { type } = req.body
   const isTypeExist = await LayoutModel.findOne({ type })
   if (isTypeExist) {
    return next(new ErrorHandler(`${type} already exist`, 400))
   }
   if (type === 'Banner') {
    const { image, title, subTitle } = req.body
    const myCloud = await cloudinary.v2.uploader.upload(image, {
     folder: 'layout',
    })

    const banner = {
     type: 'Banner',
     banners: {
      image: {
       public_id: myCloud.public_id,
       url: myCloud.secure_url,
      },
      title,
      subTitle,
     },
    }
    await LayoutModel.create(banner)
   }

   // faq code
   if (type === 'FAQ') {
    const { faqData } = req.body
    const faqItems = await Promise.all(
     faqData.map(async (item: any) => {
      return {
       question: item.question,
       answer: item.answer,
      }
     })
    )
    await LayoutModel.create({ type: 'FAQ', faq: faqItems })
   }

   // categories code
   if (type === 'Categories') {
    const { categories } = req.body
    const categoriesItems = await Promise.all(
     categories.map(async (item: any) => {
      return {
       title: item.title,
      }
     })
    )
    await LayoutModel.create({
     type: 'Categories',
     categories: categoriesItems,
    })
   }
   res.status(200).json({
    success: true,
    message: 'Layout created successfully',
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

// edit layout
export const editLayout = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { type } = req.body
   if (type === 'Banner') {
    const bannerData: any = await LayoutModel.findOne({ type: 'Banner' })
    const { image, title, subTitle } = req.body

    const data = image.startsWith('https')
     ? bannerData
     : await cloudinary.v2.uploader.upload(image, {
        folder: 'layout',
       })

    // await cloudinary.v2.uploader.destroy(bannerData.image.public_id)
    // const myCloud = await cloudinary.v2.uploader.upload(image, {
    //  folder: 'layout',
    // })

    const banner = {
     type: 'Banner',
     image: {
      public_id: image.startsWith('https')
       ? bannerData.banner.image.public_id
       : data?.public_id,
      url: image.startsWith('https')
       ? bannerData.banner.image.url
       : data.secure_url,
     },
     title,
     subTitle,
    }

    await LayoutModel.findByIdAndUpdate(
     bannerData._id,
     { banner },
     {
      new: true,
     }
    )
   }

   if (type === 'FAQ') {
    const faqData: any = await LayoutModel.findOne({ type: 'FAQ' })
    const { faq } = req.body
    if (faqData) {
     const faqItems = await Promise.all(
      faq.map(async (item: any) => {
       return {
        question: item.question,
        answer: item.answer,
       }
      })
     )

     await LayoutModel.findByIdAndUpdate(
      faqData._id,
      { type: 'FAQ', faq: faqItems },
      {
       new: true,
      }
     )
    }
   }
   if (type === 'Categories') {
    const categoriesData: any = await LayoutModel.findOne({
     type: 'Categories',
    })
    const { categories } = req.body
    if (categoriesData) {
     const categoriesItems = await Promise.all(
      categories.map(async (item: any) => {
       return {
        title: item.title,
       }
      })
     )

     await LayoutModel.findByIdAndUpdate(
      categoriesData._id,
      { type: 'Categories', categories: categoriesItems },
      {
       new: true,
      }
     )
    }
   }
   res.status(200).json({
    success: true,
    message: 'Layout updated successfully',
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

// get layout by type
export const getLayoutByType = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { type } = req.params
   const layout = await LayoutModel.findOne({ type })
   res.status(201).json({
    success: true,
    layout,
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)
