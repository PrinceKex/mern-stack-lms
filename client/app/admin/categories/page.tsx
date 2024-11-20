import DashboardHero from '@/app/components/Admin/DashboardHero'
import AdminSidebar from '@/app/components/Admin/sidebar/AdminSidebar'
import EditCategories from '@/app/components/Customization/EditCategories'
import AdminProtected from '@/app/hooks/adminProtected'
import Heading from '@/app/utils/Heading'
import React, { FC } from 'react'

type Props = {}

const Page: FC<Props> = () => {
 return (
  <div>
   <AdminProtected>
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
      <EditCategories />
     </div>
    </div>
   </AdminProtected>
  </div>
 )
}

export default Page
