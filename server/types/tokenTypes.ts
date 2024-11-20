export interface IActivationToken {
  token: string
  activationCode: string
}

export interface IActivationRequest {
  activation_token: string
  activation_code: string
}

export interface ITokenOptions {
  expires: Date
  maxAge: number
  httpOnly: boolean
  sameSite: 'lax' | 'strict' | 'none' | undefined
  secure?: boolean
}

export interface EmailOptions {
  email: string
  subject: string
  template: string
  data: { [key: string]: any }
}
