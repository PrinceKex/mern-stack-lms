'use client'
import { FC, useState } from 'react'
import Heading from '../utils/Heading'
import Header from '../components/Header'
import Protected from '../hooks/useProtected'
import { useSelector } from 'react-redux'
import Profile from '../components/Profile/Profile'

type Props = {}

const Page: FC<Props> = (props) => {
  const [open, setOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(5)
  const [route, setRoute] = useState('Login')
  const { user } = useSelector((state: any) => state.auth)

  return (
    <div>
      <Protected>
        <Heading
          title={`${user?.name} profile - Elearning`}
          description='E-learning platform is a platform for students to learn and collaborate with teachers and other professionals.'
          keywords='programming, MERN, WEBDEV, Redux Machine Learning'
        />
        <Header
          open={open}
          setOpen={setOpen}
          activeItem={activeItem}
          setRoute={setRoute}
          route={route}
        />
        <Profile user={user} />
      </Protected>
    </div>
  )
}

export default Page
