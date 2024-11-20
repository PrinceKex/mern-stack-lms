import { Box, Button, Modal } from '@mui/material'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { format } from 'timeago.js'
import React, { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AiOutlineDelete, AiOutlineMail } from 'react-icons/ai'
import { FiEdit2 } from 'react-icons/fi'
import Loader from '../../Loader/Loader'
import { BiBox } from 'react-icons/bi'
import { DataGrid } from '@mui/x-data-grid'
import { styles } from '@/app/styles/style'

type Props = {}

const ManageTeam: FC<Props> = () => {
 const { theme, setTheme } = useTheme()
 const [open, setOpen] = useState(false)
 const [courseId, setCourseId] = useState('')
 const { isLoading, data, error, refetch } = useGetAllUsersQuery(
  {},
  { refetchOnMountOrArgChange: true }
 )
 const [deleteCourse, { isSuccess, error: errorDelete }] =
  useDeleteUserMutation({})

 const columns = [
  { field: 'id', headerName: 'ID', flex: 0.3 },
  { field: 'name', headerName: 'Name', flex: 0.5 },
  { field: 'email', headerName: 'Email', flex: 0.5 },
  { field: 'role', headerName: 'Role', flex: 0.5 },
  { field: 'courses', headerName: 'Purchased Courses', flex: 0.5 },
  { field: 'created_at', headerName: 'Joined At', flex: 0.5 },
  {
   field: '  ',
   headerName: 'Edit',
   flex: 0.2,
   renderCell: (params: any) => {
    return (
     <>
      <Link
       href={`/admin/edit-course/${params.row.id}`}
       style={{ display: 'block', marginTop: '16px' }}
      >
       <FiEdit2 className='dark:text-white text-black' size={20} />
      </Link>
     </>
    )
   },
  },
  {
   field: ' ',
   headerName: 'Delete',
   flex: 0.2,
   renderCell: (params: any) => {
    return (
     <>
      <Button
       onClick={() => {
        setOpen(!open)
        setCourseId(params.row.id)
       }}
      >
       <AiOutlineDelete className='dark:text-white text-black' size={20} />
      </Button>
     </>
    )
   },
  },
  {
   field: ' ',
   headerName: 'Email',
   flex: 0.2,
   renderCell: (params: any) => {
    return (
     <>
      <a
       href={`mailto:${params.row.email}`}
       // onClick={() => {
       //  setOpen(!open)
       //  setCourseId(params.row.id)
       // }}
      >
       <AiOutlineMail className='dark:text-white text-black' size={20} />
      </a>
     </>
    )
   },
  },
 ]

 const rows: any = []

 {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  data &&
   data.users.forEach((item: any) =>
    rows.push({
     id: item._id,
     name: item.name,
     email: item.email,
     role: item.role,
     courses: item.courses.length(),
     created_at: format(item.createdAt),
     // purchased: item.courses.length(),
    })
   )
 }

 useEffect(() => {
  if (isSuccess) {
   refetch()
   toast.success('Course role deleted successfully')
   setOpen(false)
  }
  if (errorDelete) {
   if ('data' in errorDelete) {
    const errorMessage = errorDelete as any
    toast.error(errorMessage.data.message)
   }
  }
 }, [isSuccess, errorDelete])

 const handleDelete = async () => {
  const id = courseId
  await deleteCourse(id)
 }

 return (
  <div className='mt-[120px]'>
   {isLoading ? (
    <Loader />
   ) : (
    <BiBox m='20px'>
     <Box
      m='40px 0 0 0'
      height='80vh'
      sx={{
       '& .MuiDataGrid-root': {
        border: 'none',
        outline: 'none',
       },
       '& .css-pqjvzy-MuiSvgIcon-root-MuiSelect-icon': {
        color: theme === 'dark' ? '#fff' : '#000',
       },
       '& .MuiDataGrid-sortIcon': {
        color: theme === 'dark' ? '#fff' : '#000',
       },
       '& .MuiDataGrid-row': {
        color: theme === 'dark' ? '#fff' : '#000',
        borderBottom:
         theme === 'dark'
          ? '1px solid #ffffff30!important'
          : '1px solid #ccc!important',
       },
       '& .MuiTablePagination-root': {
        color: theme === 'dark' ? '#fff' : '#000',
       },
       '& .MuiDataGrid-cell': {
        borderBottom: 'none',
       },
       '& .name-column-cell': {
        color: theme === 'dark' ? '#fff' : '#000',
       },
       '&.MuiDataGrid-root .MuiDataGrid-columnHeaders': {
        //   color: theme === "dark" ? "#fff" : "#000",
        borderBottom: 'none',
        //   backgroundColor: theme === "dark" ? "#3e4396" : "#a4a9fc",
        //   backgroundColor: "#a4a9fc",
       },
       '& .MuiDataGrid-virtualScroller': {
        backgroundColor: theme === 'dark' ? '#1f2a40' : '#f2f0f0',
       },
       '& .MuiDataGrid-footerContainer': {
        color: theme === 'dark' ? '#fff' : '#000',
        borderTop: 'none',
        backgroundColor: theme === 'dark' ? '#3e4396' : '#a4a9fc',
       },
       '& .MuiCheckbox-root': {
        color: theme === 'dark' ? `#b7ebde !important` : `#000 !important`,
       },
       '& .MuiDataGrid-toolbarContainer .MuiButton-next': {
        color: `#fff !important`,
       },
      }}
     >
      <DataGrid checkboxSelection rows={rows} columns={columns} />
     </Box>
     {open && (
      <Modal
       open={open}
       onClose={() => setOpen(!open)}
       aria-labeleby='modal-modal-title'
       aria-describedy='modal-modal-description'
      >
       <Box className='absolute top-[50%] left-[50%] -translatex-1/2 -translate-y-1/2 w-[450px] bg-white dark:bg-slate-900 rounded-[8px] shadow p-4 outline-none'>
        <h1 className={`${styles.title}`}>
         Are you sure you want to delete this course?
        </h1>

        <div className='flex w-full items-center justify-between mb-6 mt-4'>
         <div
          className={`${styles.button} !w-[120px] h-[30px] bg-[#57c7a3]`}
          onClick={() => setOpen(!open)}
         >
          Cancel
         </div>
         <div
          className={`${styles.button} !w-[120px] h-[30px] bg-[#d63f3f]`}
          onClick={handleDelete}
         >
          Delete
         </div>
        </div>
       </Box>
      </Modal>
     )}
    </BiBox>
   )}
  </div>
 )
}

export default ManageTeam
