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
import RestaurantAdminHome from "../pages/dashboard/RestaurantAdminHome";
import DeliveryRegistration from "../pages/Registration/DeliveryRegistration";

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
      }
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
        path: "update-user/:id",
        element: <UpdateUser />,
        loader: async ({ params }) => {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:3000/api/auth/users/${params.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          return response.json();
        },
      },

      // restaurant admin routes
      {
        path: "restaurant-admin-home",
        element: <RestaurantAdminHome />,
      },
    ],
  },
]);
