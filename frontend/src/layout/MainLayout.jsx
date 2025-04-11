import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../components/headers/NavBar'
import Footer from '../components/footer/Footer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const MainLayout = () => {
  return (
    <main className='dark:bg-gray-900 overflow-hidden'>
      <NavBar/>
      <Outlet/>
      <Footer/>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </main>
  )
}

export default MainLayout