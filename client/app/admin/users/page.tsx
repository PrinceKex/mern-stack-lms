import DashboardHero from '@/app/components/Admin/DashboardHero'
import AdminSidebar from '@/app/components/Admin/sidebar/AdminSidebar'
import AllUsers from '@/app/components/Admin/Users/AllUsers'
import AdminProtected from '@/app/hooks/adminProtected'
import Heading from '@/app/utils/Heading'
import React, { FC } from 'react'

type Props = {}

const Users: FC<Props> = () => {
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
      <AllUsers isTeam={false} />
     </div>
    </div>
   </AdminProtected>
  </div>
 )
}

export default Users
