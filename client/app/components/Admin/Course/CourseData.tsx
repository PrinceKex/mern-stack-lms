import { styles } from '@/app/styles/style'
import React, { FC } from 'react'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import toast from 'react-hot-toast'

type Props = {
  benefits: { title: string }[]
  setBenefits: (benefits: { title: string }[]) => void
  prerequisites: { title: string }[]
  setPrerequisites: (prerequisites: { title: string }[]) => void
  active: number
  setActive: (active: number) => void
}

const CourseData: FC<Props> = ({
  benefits,
  setBenefits,
  prerequisites,
  setPrerequisites,
  active,
  setActive,
}) => {
  const handleBenefitChange = (index: number, value: any) => (e: any) => {
    const updatedBenefits = [...benefits]
    updatedBenefits[index].title = value
    setBenefits(updatedBenefits)
  }

  const handleAddBenefits = () => {
    setBenefits([...benefits, { title: '' }])
  }

  const handlePrerequisitesChange = (index: number, value: any) => (e: any) => {
    const updatedPrerequisites = [...prerequisites]
    updatedPrerequisites[index].title = value
    setPrerequisites(updatedPrerequisites)
  }

  const handleAddPrerequisites = () => {
    setPrerequisites([...prerequisites, { title: '' }])
  }

  const prevButton = () => {
    setActive(active - 1)
  }

  const handleOptions = () => {
    if (
      benefits[benefits.length - 1]?.title !== '' &&
      prerequisites[prerequisites.length - 1]?.title !== ''
    ) {
      setActive(active + 1)
    } else {
      toast.error('Please fill all the fields to go next')
    }
  }

  return (
    <div className='w-[80%] m-auto mt-24 block'>
      <div>
        <label htmlFor='benefits' className={`${styles.label} text-[20px]`}>
          What are the benefits for students in this course?
        </label>
        <br />
        {benefits.map((benefit: any, index: number) => {
          return (
            // <div key={index}>
            <input
              type='text'
              key={index}
              id='benefits'
              name='Benefit'
              placeholder='Youll be able to build a full stack LMS Platform...'
              value={benefit.title}
              onChange={handleBenefitChange(index, e.target.value)}
              className={`${styles.input} my-2`}
            />

            // </div>
          )
        })}
        <AddCircleIcon
          style={{
            margin: '10px 0',
            cursor: 'pointer',
            width: '30px',
          }}
          onClick={handleAddBenefits}
        />
      </div>
      <div>
        <label htmlFor='benefits' className={`${styles.label} text-[20px]`}>
          What are the prerequisites for students in this course?
        </label>
        <br />
        {prerequisites.map((prerequisite: any, index: number) => {
          return (
            // <div key={index}>
            <input
              type='text'
              key={index}
              id='benefits'
              name='Prerequisite'
              placeholder='You need basic knowledge of MERN'
              value={prerequisite.title}
              onChange={handlePrerequisitesChange(index, e.target.value)}
              className={`${styles.input} my-2`}
            />

            // </div>
          )
        })}
        <AddCircleIcon
          style={{
            margin: '10px 0',
            cursor: 'pointer',
            width: '30px',
          }}
          onClick={handleAddPrerequisites}
        />
      </div>
      <div className='w-full flex justify-between'>
        <div
          className='w-full 800px:w-[180px] flex justify-center items-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer'
          onClick={() => prevButton()}
        >
          Prev
        </div>
        <div
          className='w-full 800px:w-[180px] flex justify-center items-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer'
          onClick={() => handleOptions()}
        >
          Next
        </div>
      </div>
    </div>
  )
}

export default CourseData
