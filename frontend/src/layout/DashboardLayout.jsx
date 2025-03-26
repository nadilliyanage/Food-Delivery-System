import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useUser from "../hooks/useUser";
import logo from "../assets/logo.png";
import { BiHomeAlt, BiLogInCircle } from "react-icons/bi";
import { FaUsers, FaUserAlt, FaHistory } from "react-icons/fa";
import { RiDashboardFill } from "react-icons/ri";
import { FaBars, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import Scroll from "../hooks/useScroll";
import Loader from "../components/Loader/Loader";
import { MdFeedback, MdRequestQuote, MdError, MdPayments, MdFoodBank, MdDeliveryDining, MdRestaurantMenu } from "react-icons/md";
import { GiPikeman } from "react-icons/gi";
import { AiFillSchedule } from "react-icons/ai";

const adminNavItems = [
  {
    to: "/dashboard/admin-home",
    icon: <RiDashboardFill className="text-2xl" />,
    label: "Dashboard",
  },
  {
    to: "/dashboard/restaurant-requests",
    icon: <MdFoodBank className="text-2xl" />,
    label: "Restaurant Requests",
  },
  {
    to: "/dashboard/special-requests",
    icon: <MdRequestQuote className="text-2xl" />,
    label: "Special Requests",
  },
  {
    to: "/dashboard/feedbacks",
    icon: <MdFeedback className="text-2xl" />,
    label: "Customer Feedbacks",
  },
  {
    to: "/dashboard/manage-users",
    icon: <FaUsers className="text-2xl" />,
    label: "Manage Users",
  },
  {
    to: "/dashboard/manage-collectors",
    icon: <GiPikeman className="text-2xl" />,
    label: "Manage Collectors",
  },
  {
    to: "/dashboard/schedules",
    icon: <AiFillSchedule className="text-2xl" />,
    label: "Schedules",
  },
  {
    to: "/dashboard/payment-details",
    icon: <MdPayments className="text-2xl" />,
    label: "Payment Details",
  },
];

const customerNavItems = [
  {
    to: "/dashboard/user-home",
    icon: <RiDashboardFill className="text-2xl" />,
    label: "Dashboard",
  },
  {
    to: "/dashboard/my-orders",
    icon: <MdFoodBank className="text-2xl" />,
    label: "My Orders",
  },
  {
    to: "/dashboard/order-history",
    icon: <FaHistory className="text-2xl" />,
    label: "Order History",
  },
  {
    to: "/dashboard/track-delivery",
    icon: <MdDeliveryDining className="text-2xl" />,
    label: "Track Delivery",
  },
  {
    to: "/dashboard/my-payments",
    icon: <MdPayments className="text-2xl" />,
    label: "Payment History",
  },
];

const restaurantAdminNavItems = [
  {
    to: "/dashboard/restaurant-admin-home",
    icon: <RiDashboardFill className="text-2xl" />,
    label: "Dashboard",
  },
  {
    to: "/dashboard/manage-restaurants",
    icon: <MdFoodBank className="text-2xl" />,
    label: "Manage Restaurants",
  },
  {
    to: "/dashboard/manage-menus",
    icon: <MdRestaurantMenu className="text-2xl" />,
    label: "Manage Menus",
  },
];

const lastMenuItems = [
  { to: "/", icon: <BiHomeAlt className="text-2xl" />, label: "Main Home" },
  {
    to: "/dashboard/user-profile",
    icon: <FaUserAlt className="text-2xl" />,
    label: "Profile",
  },
];

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { loader, logout } = useAuth();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(currentUser?.role || 'customer');

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    // Navigate to the appropriate dashboard based on the new role
    switch (newRole) {
      case 'admin':
        navigate('/dashboard/admin-home');
        break;
      case 'customer':
        navigate('/dashboard/user-home');
        break;
      case 'restaurant_admin':
        navigate('/dashboard/restaurant-admin-home');
        break;
      case 'delivery_personnel':
        navigate('/dashboard/delivery-home');
        break;
      default:
        navigate('/dashboard/user-home');
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure want to logout?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout me!",
    }).then((result) => {
      if (result.isConfirmed) {
        logout().then(
          Swal.fire({
            title: "Logged Out!",
            text: "You have been successfully logged out.",
            icon: "success",
          })
        );
        navigate("/").catch((error) => console.log(error));
      }
    });
  };

  if (loader) {
    return <Loader />;
  }

  const renderNavItems = () => {
    switch (selectedRole) {
      case 'admin':
        return adminNavItems;
      case 'customer':
        return customerNavItems;
      case 'restaurant_admin':
        return restaurantAdminNavItems;
      default:
        return customerNavItems;
    }
  };

  return (
    <div className="flex md:flex-row flex-col">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-white shadow-lg"
      >
        {isMobileMenuOpen ? (
          <FaTimes className="h-6 w-6 text-primary" />
        ) : (
          <FaBars className="h-6 w-6 text-primary" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          open ? "w-72" : "w-[90px]"
        } bg-white h-screen p-5 pt-8 duration-300 ${
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        } fixed md:relative z-40 md:shadow-none`}
      >
        <div className="flex gap-x-4 items-center mt-2">
          <img
            onClick={() => setOpen(!open)}
            src={logo}
            alt="logo"
            className={`cursor-pointer h-[40px] duration-500 ${
              open && "rotate-[360deg]"
            }`}
          />
          <h1
            onClick={() => setOpen(!open)}
            className={`text-primary cursor-pointer font-bold origin-left text-xl duration-200 ${
              !open && "scale-0"
            }`}
          >
            EatEase
          </h1>
        </div>

        {/* Role Selector Dropdown */}
        {currentUser && (
          <div className={`mt-4 ${!open && "hidden"}`}>
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="customer">Customer Dashboard</option>
              {currentUser.role === 'admin' && (
                <option value="admin">Admin Dashboard</option>
              )}
              {currentUser.role === 'restaurant_admin' && (
                <option value="restaurant_admin">Restaurant Admin Dashboard</option>
              )}
              {currentUser.role === 'delivery_personnel' && (
                <option value="delivery_personnel">Delivery Partner Dashboard</option>
              )}
            </select>
          </div>
        )}

        {/* NavLinks */}
        <ul className="pt-6">
          <p
            className={`uppercase ml-3 text-gray-500 mb-3 ${
              !open && "hidden"
            }`}
          >
            <small>Menu</small>
          </p>
          {renderNavItems().map((menuItem, index) => (
            <li key={index} className="mb-1">
              <NavLink
                to={menuItem.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex ${
                    isActive ? "bg-primary text-white" : "text-[#413F44]"
                  } duration-150 rounded-md p-2 cursor-pointer hover:scale-105 hover:shadow-md font-bold text-sm items-center gap-x-4`
                }
              >
                {menuItem.icon}
                <span
                  className={`${
                    !open && "hidden"
                  } origin-left duration-200`}
                >
                  {menuItem.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>

        <ul className="pt-6">
          <p
            className={`uppercase ml-3 text-gray-500 mb-3 ${!open && "hidden"}`}
          >
            <small>Useful links</small>
          </p>
          {lastMenuItems.map((menuItem, index) => (
            <li key={index} className="mb-2">
              <NavLink
                to={menuItem.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex ${
                    isActive ? "bg-primary text-white" : "text-[#413F44]"
                  } duration-150 rounded-md p-2 cursor-pointer hover:scale-105 hover:shadow-md font-bold text-sm items-center gap-x-4`
                }
              >
                {menuItem.icon}
                <span
                  className={`${!open && "hidden"} origin-left duration-200`}
                >
                  {menuItem.label}
                </span>
              </NavLink>
            </li>
          ))}

          <li>
            <button
              onClick={handleLogout}
              className={`flex w-full text-[#413F44] duration-150 rounded-md p-2 cursor-pointer hover:shadow-md hover:text-red-500 font-bold text-sm items-center gap-x-4`}
            >
              <BiLogInCircle className="text-2xl" />
              <span className={`${!open && "hidden"} origin-left duration-200`}>
                Logout
              </span>
            </button>
          </li>
        </ul>

        {/* User Info Section */}
        {currentUser && (
          <div className="absolute bottom-5 px-4 flex items-center gap-x-4">
            <Link to={`/dashboard/user-profile`}>
              <img
                src={currentUser?.photoUrl}
                alt={currentUser?.name}
                className="w-12 h-12 rounded-full object-cover border-2"
              />
            </Link>
            <span
              className={`${
                !open && "hidden"
              } text-gray-700 font-semibold text-sm`}
            >
              {currentUser?.name || "User"}
            </span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="h-screen overflow-y-auto w-full md:w-[calc(100%-18rem)] px-4 md:px-8 pt-16 md:pt-0">
        <Scroll />
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
