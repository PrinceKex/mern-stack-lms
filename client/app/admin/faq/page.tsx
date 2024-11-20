import DashboardHero from '@/app/components/Admin/DashboardHero'
import AdminSidebar from '@/app/components/Admin/sidebar/AdminSidebar'
import EditFaq from '@/app/components/Customization/EditFaq'
import Heading from '@/app/utils/Heading'
import React, { FC } from 'react'

type Props = {}

const Page: FC<Props> = () => {
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
     <EditFaq />
    </div>
   </div>
  </div>
 )
}

export default Page
