'use client'

import AllCourses from '@/app/components/Admin/Course/AllCourses'
import DashboardHero from '@/app/components/Admin/DashboardHero'
import AdminSidebar from '@/app/components/Admin/sidebar/AdminSidebar'
import AdminProtected from '@/app/hooks/adminProtected'
import Heading from '@/app/utils/Heading'
import { FC } from 'react'

type Props = {}

const Courses: FC<Props> = () => {
 return (
  <div>
   <AdminProtected>
    <Heading
     title='Elearning - Admin'
     description='E-learning platform is a platform for students to learn and collaborate with teachers and other professionals.'
     keywords='programming, MERN, WEBDEV, Redux Machine Learning'
    />
    <div className='flex h-screen'>
     <div className='1500px:w-[16%] w-1/5'>
      <AdminSidebar />
     </div>
     <div className='w-[85%]'>
      <DashboardHero />
      <AllCourses />
     </div>
    </div>
   </AdminProtected>
  </div>
 )
}

export default Courses
