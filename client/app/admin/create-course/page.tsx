'use client'
import CreateCourse from '@/app/components/Admin/Course/CreateCourse'
import DashboardHeader from '@/app/components/Admin/DashboardHeader'
import AdminSidebar from '@/app/components/Admin/sidebar/AdminSidebar'
import Heading from '@/app/utils/Heading'
import React, { FC } from 'react'

type Props = {}

const page: FC<Props> = () => {
 return (
  <div>
   <Heading
    title='Elearning - Admin'
    description='E-learning platform is a platform for students to learn and collaborate with teachers and other professionals.'
    keywords='programming, MERN, WEBDEV, Redux Machine Learning'
   />
   <div className='flex'>
    <div className='1500px:w-[16%] w-1/5'>
     <AdminSidebar />
    </div>
    <div className='w-[85%]'>
     <DashboardHeader />
     <CreateCourse />
    </div>
   </div>
  </div>
 )
}

export default page
