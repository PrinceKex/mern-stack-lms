import mongoose, { Document, Model, Schema } from 'mongoose'
import { IUser } from '../types/userTypes'
import {
 IComment,
 ICourse,
 ICourseData,
 ILink,
 IReview,
} from '../types/courseTypes'

const reviewSchema = new Schema<IReview>(
 {
  user: Object,
  rating: {
   type: Number,
   default: 0,
  },
  comment: String,
  commentReplies: [Object],
 },
 { timestamps: true }
)

const linkSchema = new Schema<ILink>({
 title: String,
 url: String,
})

const commentSchema = new Schema<IComment>(
 {
  user: Object,
  question: String,
  questionReplies: [Object],
 },
 { timestamps: true }
)

const courseDataSchema = new Schema<ICourseData>({
 videoUrl: String,
 // videoThumbnail: Object,
 title: String,
 videoSection: String,
 description: String,
 videoLength: Number,
 videoPlayer: String,
 links: [linkSchema],
 suggestion: String,
 questions: [commentSchema],
})

const courseSchema = new Schema<ICourse>(
 {
  name: {
   type: String,
   required: true,
  },
  description: {
   type: String,
   required: true,
  },
  categories: {
   type: String,
   required: true,
  },
  price: {
   type: Number,
   required: true,
  },
  estimatedPrice: {
   type: Number,
  },
  thumbnail: {
   public_id: {
    type: String,
   },
   url: {
    type: String,
   },
  },
  tags: {
   type: String,
   required: true,
  },
  level: {
   type: String,
   required: true,
  },
  demoUrl: {
   type: String,
   required: true,
  },
  benefits: [{ title: String }],
  prerequisites: [{ title: String }],
  reviews: [reviewSchema],
  courseData: [courseDataSchema],
  ratings: {
   type: Number,
   default: 0,
  },
  purchased: {
   type: Number,
   default: 0,
  },
 },
 { timestamps: true }
)

const CourseModel: Model<ICourse> = mongoose.model('Course', courseSchema)

export default CourseModel
