import React from 'react'
import useUser from '../hooks/useUser'
import Loader from '../components/Loader/Loader';
import { Navigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminHome from '../pages/Dashboard/Admin/AdminHome';
import RestaurantRequests from '../pages/Dashboard/Admin/RestaurantRequests';
import DeliveryPersonnelManagement from '../pages/Dashboard/Admin/DeliveryPersonnelManagement';
import ManageUsers from '../pages/Dashboard/Admin/ManageUsers';
import UserHome from '../pages/Dashboard/User/UserHome';
import RestaurantAdminHome from '../pages/dashboard/RestaurantAdminHome';
import DeliveryPersonnelHome from '../pages/Dashboard/DeliveryPersonnel/DeliveryPersonnelHome';
import { getCurrentUser } from '../utils/auth';
import { MdLocalShipping, MdHistory, MdPerson, MdPayments, MdAccessTime } from 'react-icons/md';
import MyOrders from '../pages/MyOrders';
import OrderHistory from '../pages/OrderHistory';
import TrackDelivery from '../pages/TrackDelivery';
import PaymentHistory from '../pages/PaymentHistory';
import ManageRestaurants from '../pages/Dashboard/RestaurantAdmin/ManageRestaurants';
import RestaurantDetails from '../pages/Dashboard/RestaurantAdmin/RestaurantDetails';

const DashboardNavigate = () => {
   const {currentUser, isLoading} = useUser()
   const role = currentUser?.role;
   const location = useLocation();

   const isActive = (path) => {
     return location.pathname === path;
   };

   const getNavigationLinks = () => {
     if (!currentUser) return [];

     switch (currentUser.role) {
       case 'admin':
         return [
           { path: '/dashboard/admin-home', label: 'Admin Home' },
           { path: '/dashboard/manage-users', label: 'Manage Users' },
           { path: '/dashboard/restaurant-requests', label: 'Restaurant Requests' },
           { path: '/dashboard/delivery-requests', label: 'Delivery Requests' },
         ];
       case 'restaurant_admin':
         return [
           { path: '/dashboard/restaurant-admin-home', label: 'Restaurant Admin Home' },
           { path: '/dashboard/manage-restaurants', label: 'Manage Restaurants' },
           { path: '/dashboard/manage-menus', label: 'Manage Menus' },
         ];
       case 'delivery_personnel':
         return [
           { path: '/dashboard/delivery-home', label: 'Dashboard' },
           { path: '/dashboard/current-deliveries', label: 'Current Deliveries' },
           { path: '/dashboard/delivery-history', label: 'Delivery History' },
           { path: '/dashboard/delivery-earnings', label: 'My Earnings' },
           { path: '/dashboard/delivery-availability', label: 'Availability' },
           { path: '/dashboard/delivery-profile', label: 'Profile & Settings' },
         ];
       default:
         return [
           { path: '/dashboard/user-home', label: 'User Home' },
           { path: '/dashboard/profile', label: 'Profile' },
         ];
     }
   };

   if (isLoading) {
     return <Loader/>
   }

  if (role === 'admin') {
    return (
      <Routes>
        <Route path="admin-home" element={<AdminHome />} />
        <Route path="restaurant-requests" element={<RestaurantRequests />} />
        <Route path="delivery-requests" element={<DeliveryPersonnelManagement />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="*" element={<Navigate to="admin-home" replace />} />
      </Routes>
    );
  }

  if (role === 'customer') {
    return (
      <Routes>
        <Route path="user-home" element={<UserHome />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="order-history" element={<OrderHistory />} />
        <Route path="track-delivery" element={<TrackDelivery />} />
        <Route path="my-payments" element={<PaymentHistory />} />
        <Route path="*" element={<Navigate to="user-home" replace />} />
      </Routes>
    );
  }

  if (role === 'restaurant_admin') {
    return (
      <Routes>
        <Route path="restaurant-admin-home" element={<RestaurantAdminHome />} />
        <Route path="manage-restaurants" element={<ManageRestaurants />} />
        <Route path="restaurant/:restaurantId" element={<RestaurantDetails />} />
        <Route path="*" element={<Navigate to="restaurant-admin-home" replace />} />
      </Routes>
    );
  }

  if (role === 'delivery_personnel') {
    return (
      <Routes>
        <Route path="delivery-home" element={<DeliveryHome />} />
        <Route path="current-deliveries" element={<CurrentDeliveries />} />
        <Route path="delivery-history" element={<DeliveryHistory />} />
        <Route path="delivery-earnings" element={<Earnings />} />
        <Route path="delivery-availability" element={<Availability />} />
        <Route path="delivery-profile" element={<DeliveryProfile />} />
        <Route path="*" element={<Navigate to="delivery-home" replace />} />
      </Routes>
    );
  }

  return <Navigate to="/" replace />;
}

export default DashboardNavigate