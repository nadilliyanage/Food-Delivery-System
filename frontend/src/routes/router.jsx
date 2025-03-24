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
import QRManagement from "../pages/Dashboard/Admin/QRManagement";
import LocationManagementDashboard from "../pages/Dashboard/Admin/LocationManagementDashboard";
import Profile from "../pages/Dashboard/Profile/Profile";
import GarbageRequest from "../pages/GarbageRequest/GarbageRequest";
import ScheduleRequest from "../pages/GarbageRequest/ScheduleRequest";

import ManageCollectors from "../pages/Dashboard/Admin/ManageCollectors";
import UpdateCollector from "../pages/Dashboard/Admin/UpdateCollector";
import SpecialRequests from "../pages/Dashboard/Admin/SpecialRequests";

import PaymentHome from "../pages/Payment/PaymentHome";
import Payment from "../pages/Payment/Payment";
import PaymentHistory from "../pages/Payment/PaymentHistory";
import MakePayment from "../pages/Payment/MakePayment";
import CardPayment from "../pages/Payment/CardPayment";
import Feedbacks from "../pages/Dashboard/Admin/Feedback";
import Schedules from "../pages/Dashboard/Admin/Schedules";
import Inquiry from "../pages/Dashboard/Admin/Inquiry";
import PaymentDetails from "../pages/Dashboard/Admin/PaymentDetails";

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
        path: "/garbageRequest",
        element: <GarbageRequest />,
      },
      {
        path: "qr-scan",
        element: <QRManagement />,
      },
      {
        path: "manage-locations",
        element: <LocationManagementDashboard />,
      },
      {
        path: "scheduleRequest",
        element: <ScheduleRequest />,
      },
      {
        path: "user-profile",
        element: <Profile />,
      },
      {
        path: "/payments",
        element: <Payment />,
        children: [
          {
            path: "/payments/",
            element: <PaymentHome />,
          },
          {
            path: "/payments/make-payment",
            element: <MakePayment />,
          },
          {
            path: "/payments/payment-history",
            element: <PaymentHistory />,
          },
          {
            path: "/payments/card-payment",
            element: <CardPayment />,
          },
        ],
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
        path: "location",
        element: <Location />,
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
        path: "manage-collectors",
        element: <ManageCollectors />,
      },
      {
        path: "feedbacks",
        element: <Feedbacks />,
      },
      {
        path: "schedules",
        element: <Schedules />,
      },
      {
        path: "update-user/:id",
        element: <UpdateUser />,
        loader: ({ params }) =>
          fetch(`http://localhost:3000/users/${params.id}`),
      },
      {
        path: "update-collector/:id",
        element: <UpdateCollector />,
        loader: ({ params }) =>
          fetch(`http://localhost:3000/users/${params.id}`),
      },
      {
        path: "special-requests",
        element: <SpecialRequests />,
      },

      {
        path: "payment-details",
        element: <PaymentDetails />,
      },


      // qr management
      {
        path: "qr-scan",
        element: <QRManagement />,
      },
      {
        path: "manage-locations",
        element: <LocationManagementDashboard />,
      },
      {
        path: "manage-inquiries",
        element: <Inquiry />,
      },
    ],
  },
]);
