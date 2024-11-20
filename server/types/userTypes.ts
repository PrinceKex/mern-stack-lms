import { Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  avatar: {
    public_id: string
    url: string
  }
  role: string
  isVerified: boolean
  courses: Array<{ courseId: string }>
  comparePassword: (password: string) => Promise<boolean>
  signAccessToken: () => string
  signRefreshToken: () => string
}

export interface ILoginRequest {
  email: string
  password: string
}

export interface ISocialAuth {
  name: string
  email: string
  avatar: string
}

export interface IUpdateUserInfo {
  name?: string
  email?: string
}

export interface IUpdatePassword {
  oldPassword: string
  newPassword: string
}

export interface IUpdateProfilePicture {
  avatar: string
}

export interface IRegistrationBody {
  name: string
  email: string
  password: string
  avatar?: string
}
