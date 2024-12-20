import React, { FC, useEffect, useRef, useState } from 'react'
import { styles } from '../../styles/style'
import { VscWorkspaceTrusted } from 'react-icons/vsc'
import { any } from 'joi'
import { useSelector } from 'react-redux'
import { useActivationMutation } from '@/app/redux/features/auth/authApi'
import toast from 'react-hot-toast'

type Props = {
  setRoute: (route: string) => void
}

type verifyNumber = {
  '0': string
  '1': string
  '2': string
  '3': string
}

const Verification: FC<Props> = ({ setRoute }) => {
  const { token } = useSelector((state: any) => state.auth)
  const [activation, { isSuccess, error }] = useActivationMutation()

  const [invalidError, setInvalidError] = useState<boolean>(false)

  useEffect(() => {
    if (isSuccess) {
      toast.success('Account activated successfully')
      setRoute('Login')
    }
    if (error) {
      if ('data' in error) {
        const errorData = error as any
        toast.error(errorData?.data?.message)
        setInvalidError(true)
      } else {
        console.log('An error occured:', error)
      }
    }
  }, [isSuccess, error])

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const [verifyNumber, setVerifyNumber] = useState<verifyNumber>({
    '0': '',
    '1': '',
    '2': '',
    '3': '',
  })

  const verificationHandler = async () => {
    setInvalidError(false)
    const otp = Object.values(verifyNumber).join('')
    if (otp.length !== 4) {
      setInvalidError(true)
      return
    } else {
      await activation({
        activation_token: token,
        activation_number: otp,
      })
    }
  }

  const handleInputChange = (index: number, value: string) => {
    setInvalidError(false)
    const newVerifyNumber = { ...verifyNumber, [index]: value }

    if (value === '' && index > 0) {
      inputRefs[index - 1].current?.focus()
    } else if (value.length === 1 && index < 3) {
      inputRefs[index + 1].current?.focus()
    }
  }

  return (
    <div>
      <h1 className={`${styles.title}`}>Verify Your Account</h1>
      <br />
      <div className='w-full flex items-center justify-center mt-2'>
        <div className='w-[80px] h-[80px] rounded-full bg-[#497DF2] flex items-center justify-center'>
          <VscWorkspaceTrusted size={40} className='text-white' />
        </div>
      </div>
      <br />
      <br />
      <div className='m-auto flex items-center justify-around'>
        {Object.keys(verifyNumber).map((key, index) => {
          return (
            <input
              key={key}
              ref={inputRefs[index]}
              type='number'
              className={`w-[65px] h-[65px]bg-transparent border-[3px] rounded-[10px] flex items-center text-black dark:text-white justify-center text-[10px] font-Poppins outline-none text-center ${
                invalidError
                  ? 'shake border-red-500'
                  : 'dark:border-white border-[#0000004a]'
              }`}
              placeholder=''
              maxLength={1}
              value={verifyNumber[key as keyof verifyNumber]}
              onChange={(e) => {
                handleInputChange(index, e.target.value)
                // setVerifyNumber({ ...verifyNumber, [key]: e.target.value })
              }}
            />
          )
        })}
      </div>
      <br />
      <br />
      <div className='w-full flex justify-center'>
        <button className={`${styles.button}`} onClick={verificationHandler}>
          Verify OTP
        </button>
      </div>
      <br />
      <h5 className='text-center pt-4 font-Poppins text-[14px] text-black dark:text-white'>
        Go back to Sign In?{' '}
        <span
          className='text-[#2190ff] pl-1 cursor-pointer'
          onClick={() => props.setRoute('Login')}
        >
          Sign In
        </span>
      </h5>
    </div>
  )
}

export default Verification
