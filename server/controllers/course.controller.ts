import { NextFunction, Request, Response } from 'express'
import { createCourse, getAllCoursesService } from '../services/course.service'
import { catchAsyncError } from '../utils/catchAsyncErrors'
import ErrorHandler from '../utils/errorHandler'
import cloudinary from 'cloudinary'
import CourseModel from '../models/course.model'
import { redis } from '../utils/redis'
import {
 IAddAnswerData,
 IAddQuestionData,
 IAddResponseData,
 IAddReviewData,
} from '../types/courseTypes'
import mongoose from 'mongoose'
import ejs from 'ejs'
import path from 'path'
import sendMail from '../utils/sendMail'
import NotificationModel from '../models/notification.Model'
import axios from 'axios'

// upload course
export const uploadCourse = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const data = req.body
   const thumbnail = data.thumbnail
   if (thumbnail) {
    const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
     folder: 'courses',
    })
    data.thumbnail = {
     public_id: myCloud.public_id,
     url: myCloud.secure_url,
    }
   }
   createCourse(data, res, next)
   res.status(200).json({
    success: true,
    message: 'Course Uploaded Successfully',
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

// edit course
export const editCourse = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const data = req.body
   const thumbnail = data.thumbnail
   const courseId = req.params.id

   const courseData = (await CourseModel.findById(courseId)) as any
   if (!courseData) {
    return next(new ErrorHandler('Course not found', 404))
   }

   if (thumbnail && !thumbnail.startsWith('https')) {
    await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id)

    const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
     folder: 'courses',
    })
    data.thumbnail = {
     public_id: myCloud.public_id,
     url: myCloud.secure_url,
    }
   }

   if (thumbnail.startsWith('https')) {
    data.thumbnail = {
     public_id: courseData?.thumbnail.public_id,
     url: courseData?.thumbnail.url,
    }
   }

   // const courseId = req.params.id
   const course = await CourseModel.findByIdAndUpdate(
    courseId,
    { $set: data },
    {
     new: true,
    }
   )

   res.status(201).json({
    success: true,
    course,
    message: 'Course Updated Successfully',
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

// Get Single Course - without purchasing
export const getSingleCourse = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const courseId = req.params.id
   const isCacheExist = await redis.get(courseId)
   if (isCacheExist) {
    const course = JSON.parse(isCacheExist)
    res.status(200).json({
     success: true,
     course,
    })
   } else {
    const course = await CourseModel.findById(courseId).select(
     '-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links'
    )
    await redis.set(courseId, JSON.stringify(course), 'EX', 604800)

    res.status(200).json({
     success: true,
     course,
    })
   }
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

//Get All Courses = without purchasing
export const getAllCourses = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const courses = await CourseModel.find({}).select(
    '-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links'
   )
   // await redis.set('allCourses', JSON.stringify(courses))
   res.status(200).json({
    success: true,
    courses,
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

// get Course Content -- valid user
export const getCourseByUser = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const user = req.user
   const userCourseList = req.user?.courses
   const courseId = req.params.id
   const courseExists = userCourseList?.find(
    (course: any) => course._id.toString() === courseId
   )
   if (!courseExists) {
    return next(
     new ErrorHandler('You are not eligible to access this course', 404)
    )
   }
   const course = await CourseModel.findById(courseId)
   const content = course?.courseData
   if (!content) {
    return next(
     new ErrorHandler('You are not eligible to access this course ', 400)
    )
   }

   res.status(200).json({
    success: true,
    content,
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

// add question in course
export const addQuestion = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { question, courseId, contentId }: IAddQuestionData = req.body
   const course = await CourseModel.findById(courseId)

   if (!mongoose.Types.ObjectId.isValid(contentId)) {
    return next(new ErrorHandler('Invalid content id', 400))
   }

   const courseContent = course?.courseData?.find((item: any) =>
    item._id.equals(contentId)
   )
   if (!courseContent) {
    return next(new ErrorHandler('Invalid content id', 400))
   }

   // create a new Question Object
   const newQuestion: any = {
    user: req.user,
    question,
    questionReplies: [],
   }

   // add this question to our course content
   courseContent.questions.push(newQuestion)

   // create a notification to inform user
   await NotificationModel.create({
    user: req.user?._id,
    title: 'New Question',
    message: `You have a new question in ${courseContent?.title}`,
   })

   // save the new question to db
   await course?.save()

   res.status(200).json({
    success: true,
    message: 'Question added successfully',
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

// add answer in course question
export const addAnswer = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body

   const course = await CourseModel.findById(courseId)

   if (!mongoose.Types.ObjectId.isValid(contentId)) {
    return next(new ErrorHandler('Invalid content id', 400))
   }

   const courseContent = course?.courseData?.find((item: any) =>
    item._id.equals(contentId)
   )
   if (!courseContent) {
    return next(new ErrorHandler('Invalid content id', 400))
   }

   const question = courseContent?.questions?.find((item: any) =>
    item._id.equals(questionId)
   )
   if (!question) {
    return next(new ErrorHandler('Invalid question id', 400))
   }

   // create a new answer object
   const newAnswer: any = {
    user: req.user,
    answer,
    createdAt: new Date(Date.now()),
   }
   question.questionReplies?.push(newAnswer)
   await course?.save()

   if (req.user?._id === question.user._id) {
    // create a notification
    // create a notification to inform user
    await NotificationModel.create({
     user: req.user?._id,
     title: 'New Question Reply Received',
     message: `You have a new question reply  in ${courseContent?.title}`,
    })
   } else {
    const data = {
     name: question.user.name,
     title: courseContent.title,
    }
    const html = await ejs.renderFile(
     path.join(__dirname, '../mails/question-reply.ejs'),
     data
    )
    try {
     await sendMail({
      email: question.user.email,
      subject: 'Question Reply',
      template: 'question-reply.ejs',
      data,
     })
    } catch (error: any) {
     return next(new ErrorHandler(error.message, 500))
    }
   }

   res.status(200).json({
    success: true,
    message: 'Answer added successfully',
    course,
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

// add review in course
export const addReview = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const userCourseList = req.user?.courses
   const courseId = req.params.id
   // check if course id already exist in userCourseList based on _id
   const courseExists = userCourseList?.some(
    (course: any) => course._id.toString() === courseId.toString()
   )
   if (!courseExists) {
    return next(
     new ErrorHandler('You are not eligible to access this course', 400)
    )
   }

   const course = await CourseModel.findById(courseId)
   if (!course) {
    return next(new ErrorHandler('Course not found', 404))
   }

   const { rating, review } = req.body as IAddReviewData
   const reviewData: any = {
    user: req.user,
    comment: review,
    rating,
   }

   course.reviews.push(reviewData)
   let avg = 0
   course.reviews.forEach((rev: any) => {
    avg += rev.rating
   })
   course.ratings = avg / course.reviews.length
   await course.save()

   const notification = {
    title: 'New Review Received',
    message: `${req.user?.name} has given a review in ${course.name}`,
   }
   // create notification

   res.status(200).json({
    success: true,
    message: 'Review added successfully',
    course,
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

// add replies to review
export const addReplyToReview = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { comment, courseId, reviewId } = req.body as IAddResponseData

   const course = await CourseModel.findById(courseId)
   if (!course) {
    return next(new ErrorHandler('Course not found', 404))
   }

   const review = course.reviews?.find(
    (rev: any) => rev._id.toString() === reviewId
   )
   if (!review) {
    return next(new ErrorHandler('Review not found', 404))
   }

   const replyData: any = {
    user: req.user,
    comment,
   }

   if (!review.commentReplies) {
    review.commentReplies = []
   }
   review.commentReplies?.push(replyData)
   await course.save()

   res.status(200).json({
    success: true,
    message: 'Reply added successfully',
    course,
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

// get all courses -- only for admin
export const getAllCoursesAdmin = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   getAllCoursesService(res)
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

// delete course -- only for admin
export const deleteCourse = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { id } = req.params
   const course = await CourseModel.findById(id)

   if (!course) {
    return next(new ErrorHandler('Course not found', 404))
   }
   await course.deleteOne({ id })
   await redis.del(id)

   res.status(200).json({
    success: true,
    message: 'Course deleted successfully',
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 500))
  }
 }
)

// generate video url --- api key not add to env
export const generateVideoUrl = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { videoId } = req.body
   const response = await axios.post(
    `https://dev.vdocipher.com/api/videos/${videoId}/otp`,

    { ttl: 300 },
    {
     headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
     },
    }
   )
   res.json(response.data)
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)
