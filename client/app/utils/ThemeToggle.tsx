'use client'
import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'
import { BiMoon, BiSun } from 'react-icons/bi'

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className='flex items-center justify-center mx-4'>
      {theme === 'light' ? (
        <BiMoon
          className='cursor-pointer'
          fill='black'
          size={25}
          onClick={() => setTheme('dark')}
        />
      ) : (
        <BiSun
          className='cursor-pointer'
          fill='yellow'
          size={25}
          onClick={() => setTheme('light')}
        />
      )}
    </div>
  )
}

export default ThemeToggle
