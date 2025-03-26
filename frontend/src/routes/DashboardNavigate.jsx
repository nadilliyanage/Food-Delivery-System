import React from 'react'
import useUser from '../hooks/useUser'
import Loader from '../components/Loader/Loader';
import { Navigate, Routes, Route } from 'react-router-dom';
import AdminHome from '../pages/Dashboard/Admin/AdminHome';
import RestaurantRequests from '../pages/Dashboard/Admin/RestaurantRequests';
import ManageUsers from '../pages/Dashboard/Admin/ManageUsers';
import UserHome from '../pages/Dashboard/User/UserHome';
import RestaurantAdminHome from '../pages/dashboard/RestaurantAdminHome';
import DeliveryPersonnelHome from '../pages/Dashboard/DeliveryPersonnel/DeliveryPersonnelHome';

const DashboardNavigate = () => {
   const {currentUser, isLoading} = useUser()
   const role = currentUser?.role;

   if (isLoading) {
     return <Loader/>
   }

  if (role === 'admin') {
    return (
      <Routes>
        <Route path="admin-home" element={<AdminHome />} />
        <Route path="restaurant-requests" element={<RestaurantRequests />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="*" element={<Navigate to="admin-home" replace />} />
      </Routes>
    );
  }

  if (role === 'customer') {
    return (
      <Routes>
        <Route path="user-home" element={<UserHome />} />
        <Route path="*" element={<Navigate to="user-home" replace />} />
      </Routes>
    );
  }

  if (role === 'restaurant_admin') {
    return (
      <Routes>
        <Route path="restaurant-admin-home" element={<RestaurantAdminHome />} />
        <Route path="*" element={<Navigate to="restaurant-admin-home" replace />} />
      </Routes>
    );
  }

  if (role === 'delivery_personnel') {
    return (
      <Routes>
        <Route path="delivery-home" element={<DeliveryPersonnelHome />} />
        <Route path="*" element={<Navigate to="delivery-home" replace />} />
      </Routes>
    );
  }

  return <Navigate to="/" replace />;
}

export default DashboardNavigate