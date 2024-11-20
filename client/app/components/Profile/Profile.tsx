'use client'
import React, { FC, useState } from 'react'
import SidebarProfile from './SidebarProfile'
import { useLogOutQuery } from '@/app/redux/features/auth/authApi'
import { redirect } from 'next/navigation'
import { signOut } from 'next-auth/react'
import ProfileInfo from './ProfileInfo'
import ChangePassword from './ChangePassword'

type Props = {
  user: any
}

const Profile: FC<Props> = ({ user }) => {
  const [scroll, setScroll] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [active, setActive] = useState(1)
  const [logout, setLogout] = useState(false)
  const {} = useLogOutQuery(undefined, {
    skip: !logout ? true : false,
  })

  const logoutHandler = async () => {
    setLogout(true)
    await signOut()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 85) {
        setScroll(true)
      } else {
        setScroll(false)
      }
    })
  }

  return (
    <div className='w-[85%] flex mx-auto'>
      <div
        className={`w-[60px] 800px:w-[310px] h-[45px] dark:bg-slate-900 bg-white bg-opacity-90 border dark:border-[#ffffff1d] border-[#00000014] rounded-[5px] shadow-sm my-[80px] sticky ${
          scroll ? 'top-[120px]' : 'top-[30px]'
        }"left-[120px]"`}
      >
        <SidebarProfile
          user={user}
          active={active}
          avatar={avatar}
          setActive={setActive}
          logoutHandler={logoutHandler}
        />
      </div>
      {active === 1 && <ProfileInfo user={user} avatar={avatar} />}

      {active === 2 && <ChangePassword />}
    </div>
  )
}

export default Profile
