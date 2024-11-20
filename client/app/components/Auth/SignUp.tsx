'use client'
import React, { FC, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiFillGithub,
} from 'react-icons/ai'
import { FcGoogle } from 'react-icons/fc'
import { styles } from '../../styles/style'
import { useRegisterMutation } from '@/app/redux/features/auth/authApi'
import toast from 'react-hot-toast'

type Props = {
  setRoute: (route: string) => void
  setOpen: (open: boolean) => void
}

const schema = Yup.object().shape({
  name: Yup.string().required('Please enter your name'),
  email: Yup.string()
    .email('Invalid email')
    .required('Please enter your email'),
  password: Yup.string()
    .required('Please enter your password')
    .min(6, 'Password must be at least 6 characters'),
})

const SignUp: FC<Props> = ({ setRoute }) => {
  const [show, setShow] = useState(false)
  const [register, { data, error, isSuccess }] = useRegisterMutation()

  useEffect(() => {
    if (isSuccess) {
      const message = data?.message || 'Registration successful '
      toast.success(message)
      setRoute('verification')
    }
    if (error) {
      if ('data' in error) {
        const errorData = error as any
        toast.error(errorData?.data?.message)
      }
    }
  }, [isSuccess, error])

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: schema,
    onSubmit: async ({ name, email, password }) => {
      const data = {
        name,
        email,
        password,
      }
      await register(data)
    },
  })

  const { errors, touched, values, handleChange, handleSubmit } = formik

  return (
    <div className='w-full'>
      <h1 className={'${styles.title}'}>Join ELearning</h1>
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <label className={`$ {styles.label}`} htmlFor='name'>
            Enter your Name
          </label>
          <input
            type='name'
            id='name'
            name='name'
            onChange={handleChange}
            value={values.name}
            className={`${errors.name && touched.name && 'border-red-500'} ${
              styles.input
            }`}
            placeholder='Enter your Name'
          />
          {errors.name && touched.name && (
            <span className='text-red-500 pt-2 block'> {errors.name}</span>
          )}
        </div>
        <label className={`${styles.label}`} htmlFor='email'>
          Enter your Email
        </label>
        <input
          type='email'
          id='email'
          name='email'
          onChange={handleChange}
          value={values.email}
          className={`${errors.email && touched.email && 'border-red-500'} ${
            styles.input
          }`}
          placeholder='Enter your email'
        />
        {errors.email && touched.email && (
          <span className='text-red-500 pt-2 block'> {errors.email}</span>
        )}
        <div className='w-full mt-5 mb-1 relative'>
          <label className={`${styles.label}`} htmlFor='password'>
            Enter your Password
          </label>
          <input
            type={!show ? 'password' : 'text'}
            id='password'
            name='password'
            onChange={handleChange}
            value={values.password}
            className={`${
              errors.password && touched.password && 'border-red-500'
            } ${styles.input}`}
            placeholder='password!@#$'
          />

          {!show ? (
            <AiOutlineEyeInvisible
              onClick={() => setShow(true)}
              size={20}
              className='absolute bottom-3 right-2 z-1 cursor-pointer'
            />
          ) : (
            <AiOutlineEye
              onClick={() => setShow(false)}
              size={20}
              className='absolute bottom-3 right-2 z-1 cursor-pointer'
            />
          )}
        </div>
        {errors.password && touched.password && (
          <span className='text-red-500 pt-2 block'> {errors.password}</span>
        )}
        <div className='w-full mt-5'>
          <input type='submit' value='Sign Up' className={`${styles.button}`} />
        </div>
        <br />
        <h5 className='text-center pt-4 font-Poppins text=[14px] text-block dark:text-white'>
          Or join with
        </h5>
        <div className='flex items-center justify-center my-3'>
          <FcGoogle size={25} className='mr-2' />
          <AiFillGithub size={30} className='cursor-pointer ml-2' />
        </div>
        <h5 className='text-center pt-4 font-Poppins text=[14px]'>
          Already have an account?{' '}
          <span
            className='text-[#2190ff] pl-1 cursor-pointer'
            onClick={() => setRoute('Login')}
          >
            Sign In
          </span>
        </h5>
      </form>
      <br />
    </div>
  )
}

export default SignUp
