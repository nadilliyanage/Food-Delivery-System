import React from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home/Home";
import Services from "../pages/Services/Services";
import ContactUs from "../pages/ContactUs/ContactUs";
import AboutUs from "../pages/AboutUs/AboutUs";
import Login from "../pages/user/Login";
import Register from "../pages/user/Register";
import DashboardLayout from "../layout/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserHome from "../pages/Dashboard/User/UserHome";
import AdminHome from "../pages/Dashboard/Admin/AdminHome";
import ManageUsers from "../pages/Dashboard/Admin/ManageUsers";
import UpdateUser from "../pages/Dashboard/Admin/UpdateUser";
import Profile from "../pages/Dashboard/Profile/Profile";
import RestaurantRegistration from "../pages/RestaurantRegistration/RestaurantRegistration";
import RestaurantRequests from "../pages/Dashboard/Admin/RestaurantRequests";
import DeliveryPersonnelManagement from "../pages/Dashboard/Admin/DeliveryPersonnelManagement";
import RestaurantAdminHome from "../pages/dashboard/RestaurantAdminHome";
import DeliveryRegistration from "../pages/Registration/DeliveryRegistration";
import DeliveryHome from "../pages/Dashboard/DeliveryHome";
import CurrentDeliveries from "../pages/Dashboard/Delivery/CurrentDeliveries";
import DeliveryHistory from "../pages/Dashboard/Delivery/DeliveryHistory";
import DeliveryProfile from "../pages/Dashboard/Delivery/DeliveryProfile";
import Earnings from "../pages/Dashboard/Delivery/Earnings";
import Availability from "../pages/Dashboard/Delivery/Availability";
import { Navigate } from "react-router-dom";
import MyOrders from "../pages/MyOrders";
import OrderHistory from "../pages/OrderHistory";
import TrackDelivery from "../pages/TrackDelivery";
import PaymentHistory from "../pages/PaymentHistory";
import ManageRestaurants from "../pages/Dashboard/RestaurantAdmin/ManageRestaurants";
import RestaurantDetails from "../pages/Dashboard/RestaurantAdmin/RestaurantDetails";
import EditMenuItem from "../pages/Dashboard/RestaurantAdmin/EditMenuItem";
import ManageOrders from "../pages/Dashboard/RestaurantAdmin/ManageOrders";
import Cart from "../pages/Cart/Cart";
import RestaurantDetailsInHome from "../pages/Restaurant/RestaurantDetails";
import CartDetails from "../pages/Cart/CartDetails";
import Checkout from "../pages/Checkout/Checkout";
import OrderDetails from "../pages/OrderDetails";
import OutForDelivery from "../pages/Dashboard/Delivery/OutForDelivery";
import RestaurantsPage from "../pages/Restaurants/RestaurantsPage";
import DashboardRestaurants from "../pages/Dashboard/User/Restaurants";
import EditRestaurant from "../pages/Dashboard/RestaurantAdmin/EditRestaurant";
import Notifications from "../pages/Notifications/Notifications";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/restaurants",
        element: <RestaurantsPage />,
      },
      {
        path: "/services",
        element: <Services />,
      },
      {
        path: "/contact",
        element: <ContactUs />,
      },
      {
        path: "/aboutUs",
        element: <AboutUs />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "user-profile",
        element: <Profile />,
      },
      {
        path: "restaurant-registration",
        element: <RestaurantRegistration />,
      },
      {
        path: "delivery-registration",
        element: <DeliveryRegistration />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "restaurant/:id",
        element: <RestaurantDetailsInHome />,
      },
      {
        path: "cart/:restaurantId",
        element: <CartDetails />,
      },
      {
        path: "checkout/:restaurantId",
        element: <Checkout />,
      },
      {
        path: "my-orders",
        element: <MyOrders />,
      },
      {
        path: "order-details/:orderId",
        element: <OrderDetails />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "user-profile",
        element: <Profile />,
      },

      // user routes
      {
        path: "user-home",
        element: <UserHome />,
      },
      {
        path: "restaurants",
        element: <DashboardRestaurants />,
      },
      {
        path: "my-orders",
        element: <MyOrders />,
      },
      {
        path: "order-history",
        element: <OrderHistory />,
      },
      {
        path: "track-delivery",
        element: <TrackDelivery />,
      },
      {
        path: "my-payments",
        element: <PaymentHistory />,
      },

      // admin routes
      {
        path: "admin-home",
        element: <AdminHome />,
      },
      {
        path: "manage-users",
        element: <ManageUsers />,
      },
      {
        path: "restaurant-requests",
        element: <RestaurantRequests />,
      },
      {
        path: "delivery-requests",
        element: <DeliveryPersonnelManagement />,
      },
      {
        path: "update-user/:id",
        element: <UpdateUser />,
        loader: async ({ params }) => {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `http://localhost:3000/api/auth/users/${params.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          return response.json();
        },
      },

      // restaurant admin routes
      {
        path: "restaurant-admin-home",
        element: <RestaurantAdminHome />,
      },
      {
        path: "manage-restaurants",
        element: <ManageRestaurants />,
      },
      {
        path: "restaurant/:restaurantId",
        element: <RestaurantDetails />,
      },
      {
        path: "restaurant/:restaurantId/edit",
        element: <EditRestaurant />,
      },
      {
        path: "manage-restaurants/:restaurantId/menu/:menuItemId/edit",
        element: <EditMenuItem />,
      },
      {
        path: "manage-orders",
        element: <ManageOrders />,
      },

      // delivery personnel routes
      {
        path: "delivery-home",
        element: <DeliveryHome />,
      },
      {
        path: "current-deliveries",
        element: <CurrentDeliveries />,
      },
      {
        path: "delivery-history",
        element: <DeliveryHistory />,
      },
      {
        path: "earnings",
        element: <Earnings />,
      },
      {
        path: "availability",
        element: <Availability />,
      },
      {
        path: "delivery-profile",
        element: <DeliveryProfile />,
      },
      {
        path: "out-for-delivery",
        element: <OutForDelivery />,
      },
    ],
  },
]);
