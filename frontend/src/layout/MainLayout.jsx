import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../components/headers/NavBar'
import Footer from '../components/footer/Footer'

const MainLayout = () => {
  return (
    <main className='dark:bg-gray-900 overflow-hidden'>
      <NavBar/>
      <Outlet/>
      <Footer/>
    </main>
  )
}

export default MainLayout