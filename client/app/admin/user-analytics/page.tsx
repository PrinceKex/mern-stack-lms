import UsersAnalytics from '@/app/components/Admin/Analytics/UsersAnalytics'
import DashboardHero from '@/app/components/Admin/DashboardHero'
import AdminSidebar from '@/app/components/Admin/sidebar/AdminSidebar'
import Heading from '@/app/utils/Heading'
import React from 'react'

type Props = {}

const Page = () => {
 return (
  <div>
   <Heading
    title='LMS - Admin'
    description='LMS is a platform for students to learn and get help from teachers'
    keywords='Programming, MERN, Redux, Machine Learning'
   />
   <div className='flex h-screen'>
    <div className='1500px:w-[16%] w-1/5'>
     <AdminSidebar />
    </div>
    <div className='w-[85%]'>
     <DashboardHero />
     <UsersAnalytics />
    </div>
   </div>
  </div>
 )
}

export default Page
