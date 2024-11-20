'use client'
import React, { FC, useState } from 'react'
import Heading from './utils/Heading'
import Header from './components/Header'

interface Props {}

const Page: FC<Props> = (props) => {
  const [open, setOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(0)
  const [route, setRoute] = useState('Login')

  return (
    <div>
      <Heading
        title='Elearning Platform'
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
    </div>
  )
}

export default Page
