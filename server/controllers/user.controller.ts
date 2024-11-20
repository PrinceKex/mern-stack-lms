require('dotenv').config()
import { Request, Response, NextFunction } from 'express'
import userModel from '../models/user.model'
import {
 ILoginRequest,
 IRegistrationBody,
 ISocialAuth,
 IUpdatePassword,
 IUpdateUserInfo,
 IUser,
} from '../types/userTypes'
import ErrorHandler from '../utils/errorHandler'
import { catchAsyncError } from '../utils/catchAsyncErrors'
import jwt, { JwtPayload, Secret } from 'jsonwebtoken'
import ejs from 'ejs'
import path from 'path'
import { IActivationRequest, IActivationToken } from '../types/tokenTypes'
import sendMail from '../utils/sendMail'
import {
 accessTokenOptions,
 refreshTokenOptions,
 sendToken,
} from '../utils/jwt'
import { redis } from '../utils/redis'
import {
 getAllUsersService,
 getUserById,
 updateUserRoleServices,
} from '../services/user.service'
import cloudinary from 'cloudinary'

// register user
export const registerUser = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { name, email, password } = req.body
   const isEmailExist = await userModel.findOne({ email })
   if (isEmailExist) {
    return next(new ErrorHandler('Email already exist', 400))
   }

   const user: IRegistrationBody = {
    name,
    email,
    password,
   }

   const activationToken = createActivationToken(user)
   const activationCode = activationToken.activationCode
   const data = { user: { name: user.name }, activationCode }
   const html = await ejs.renderFile(
    path.join(__dirname, '../mails/activation.mail.ejs'),
    data
   )
   // const activationLink = `${process.env.CLIENT_URL}/user/activate/${activationCode}`

   try {
    await sendMail({
     email: user.email,
     subject: 'Activate your Account',
     template: 'activation.mail.ejs',
     data,
    })
    res.status(201).json({
     success: true,
     message: `Please check your email ${user.email} to activate your account`,
     activationToken: activationToken.token,
    })
   } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
   }

   // res.status(201).json({
   //   success: true,
   //   message: 'User registered successfully',
   //   user,
   // })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)

export const createActivationToken = (user: any): IActivationToken => {
 const activationCode = Math.floor(1000 + Math.random() * 9000).toString()

 const token = jwt.sign(
  { user, activationCode },
  process.env.ACTIVATION_SECRET as Secret,
  { expiresIn: '5m' }
 )

 return {
  activationCode,
  token,
 }
}

// activate user
export const activateUser = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { activation_token, activation_code } = req.body as IActivationRequest

   const newUser: { user: IUser; activationCode: string } = jwt.verify(
    activation_token,
    process.env.ACTIVATION_SECRET as Secret
   ) as { user: IUser; activationCode: string }

   if (newUser.activationCode !== activation_code) {
    return next(new ErrorHandler('Invalid activation code', 400))
   }

   const { name, email, password } = newUser.user

   const existUser = await userModel.findOne({ email })
   if (existUser) {
    return next(new ErrorHandler('Email already exist', 400))
   }

   const user = await userModel.create({ name, email, password })

   res.status(201).json({
    success: true,
    message: 'User registered successfully',
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)

// login user
export const loginUser = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { email, password } = req.body as ILoginRequest
   if (!email || !password) {
    return next(new ErrorHandler('Please enter email and password', 400))
   }
   const user = await userModel.findOne({ email }).select('password')
   if (!user) {
    return next(new ErrorHandler('Invalid email or password', 400))
   }

   const isPasswordMatch = await user.comparePassword(password)
   if (!isPasswordMatch) {
    return next(new ErrorHandler('Invalid email or password', 400))
   }
   sendToken(user, 200, res)
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)

// logout user
export const logoutUser = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   res.cookie('access_token', '', {
    maxAge: 1,
   })
   res.cookie('refresh_token', '', {
    maxAge: 1,
   })
   const userId = (req.user?._id || '') as string
   redis.del(userId)

   res.status(200).json({
    success: true,
    message: 'Logged out successfully',
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)

// update access token
export const updateAccessToken = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const refresh_token = req.cookies.refresh_token as string
   const decoded = jwt.verify(
    refresh_token,
    process.env.REFRESH_TOKEN as string
   ) as JwtPayload

   const message = 'could not decode token'
   if (!decoded) {
    return next(new ErrorHandler(message, 400))
   }

   const session = (await redis.get(decoded.id)) as string
   if (!session) {
    return next(new ErrorHandler(message, 400))
   }

   const user = JSON.parse(session)
   const accessToken = jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN as string,
    { expiresIn: '5m' }
   )
   const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN as string,
    { expiresIn: '3d' }
   )

   req.user = user
   res.cookie('access_token', accessToken, accessTokenOptions)
   res.cookie('refresh_token', refreshToken, refreshTokenOptions)

   await redis.set(user._id, JSON.stringify(user), 'EX', 604800) //7Days

   next()
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)

// get user info
export const getUserInfo = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const userId = req.user?._id as string
   getUserById(userId, res)
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)

// social auth
export const socialAuth = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { name, email, avatar } = req.body as ISocialAuth
   const user = await userModel.findOne({ email })
   if (user) {
    sendToken(user, 200, res)
   } else {
    const newUser = await userModel.create({ name, email, avatar })
    sendToken(newUser, 200, res)
   }
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)

// update user info
export const updateUserInfo = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { name } = req.body as IUpdateUserInfo
   const userId = req.user?._id as string
   const user = await userModel.findById(userId)

   // if (email && user) {
   //   const isEmailExist = await userModel.findOne({ email })
   //   if (isEmailExist) {
   //     return next(new ErrorHandler('Email already exist', 400))
   //   }
   //   user.email = email
   // }

   if (name && user) {
    user.name = name
   }
   await user?.save()
   await redis.set(userId, JSON.stringify(user))

   res.status(201).json({
    success: true,
    user,
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)

// update user password
export const updateUserPassword = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { oldPassword, newPassword } = req.body as IUpdatePassword

   if (!oldPassword || !newPassword) {
    return next(
     new ErrorHandler('Please enter old password and new password', 400)
    )
   }

   const user = await userModel.findById(req.user?._id).select('password')
   if (user?.password === undefined) {
    return next(new ErrorHandler('User not found', 400))
   }

   const isPasswordMatch = await user?.comparePassword(oldPassword)
   if (!isPasswordMatch) {
    return next(new ErrorHandler('Invalid old password', 400))
   }
   user.password = newPassword
   await user.save()
   const userId = req.user?._id as string
   await redis.set(userId, JSON.stringify(user))

   res.status(201).json({
    success: true,
    user,
    message: 'Password updated successfully',
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)

//update profile picture
export const updateProfilePicture = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { avatar } = req.body
   const userId = req.user?._id as string
   const user = await userModel.findById(userId)
   // const user = req.user
   if (avatar && user) {
    // if there is an existing avatar
    if (user?.avatar.public_id) {
     // delete old image
     await cloudinary.v2.uploader.destroy(user?.avatar.public_id)
     // upload new image
     const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: 'avatars',
      width: 150,
     })
     user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
     }
    } else {
     // upload new image
     const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: 'avatars',
      width: 150,
     })
     user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
     }
    }
   }

   await user?.save()
   await redis.set(userId, JSON.stringify(user))
   res.status(200).json({
    success: true,
    user,
    message: 'Profile picture updated successfully',
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)

// get all users -- only for admin
export const getAllUsers = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   getAllUsersService(res)
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)

// update user role -- only for admin
export const updateUserRole = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { id, role } = req.body
   updateUserRoleServices(res, id, role)
   // const user = await userModel.findById(id)
   // if (!user) {
   //   return next(new ErrorHandler('User not found', 400))
   // }
   // user.role = role
   // await user.save()
   // await redis.set(id, JSON.stringify(user))

   // res.status(201).json({
   //   success: true,
   //   user,
   //   message: 'User role updated successfully',
   // })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)

// delete user -- only for admin
export const deleteUser = catchAsyncError(
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const { id } = req.params
   const user = await userModel.findById(id)
   if (!user) {
    return next(new ErrorHandler('User not found', 400))
   }

   await cloudinary.v2.uploader.destroy(user?.avatar.public_id)
   await user.deleteOne({ _id: id })
   await redis.del(id)

   res.status(200).json({
    success: true,
    message: 'User deleted successfully',
   })
  } catch (error: any) {
   return next(new ErrorHandler(error.message, 400))
  }
 }
)
