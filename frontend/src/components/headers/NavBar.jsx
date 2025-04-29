import React, { useContext, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaCreditCard,
  FaInfoCircle,
  FaUtensils,
  FaEnvelope,
  FaUser,
  FaSignOutAlt,
  FaShoppingCart,
  FaListAlt,
  FaStore,
  FaMotorcycle,
  FaBox,
  FaChartBar,
  FaBell,
  FaCheck,
} from "react-icons/fa";
import { MdDashboard, MdDoneAll } from "react-icons/md";
import userImg from "../../assets/farmer.jpg";
import { motion } from "framer-motion";
import { AuthContext } from "../../utilities/providers/AuthProvider";
import { useCart } from "../../utilities/providers/CartProvider";
import Swal from "sweetalert2";
import useUser from "../../hooks/useUser";
import logo from "/logo.png";
import { isAuthenticated } from "../../utils/auth";
import axios from "axios";

const navLinks = [
  { name: "Home", route: "/", icon: FaHome },
  { name: "Payments", route: "/payments", icon: FaCreditCard },
  { name: "About Us", route: "/aboutUs", icon: FaInfoCircle },
  { name: "Services", route: "/services", icon: FaUtensils },
  { name: "Contact Us", route: "/contact", icon: FaEnvelope },
];

const customerMobileNav = [
  { name: "Home", route: "/", icon: FaHome },
  { name: "Restaurants", route: "/restaurants", icon: FaStore },
  { name: "Cart", route: "/cart", icon: FaShoppingCart },
  { name: "Orders", route: "/my-orders", icon: FaListAlt },
];

const deliveryMobileNav = [
  { name: "Home", route: "/", icon: FaHome },
  { name: "Pick Orders", route: "/dashboard/out-for-delivery", icon: FaBox },
  {
    name: "Deliveries",
    route: "/dashboard/current-deliveries",
    icon: FaMotorcycle,
  },
];

const restaurantAdminMobileNav = [
  { name: "Home", route: "/", icon: FaHome },
  { name: "Restaurant", route: "/manage-restaurant", icon: FaStore },
];

const adminMobileNav = [{ name: "Home", route: "/", icon: FaHome }];

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHome, setIsHome] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isFixed, setIsFixed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [navBg, setNavBg] = useState("bg-[#15151580]");
  const { logout, user } = useContext(AuthContext);
  const { currentUser } = useUser();
  const { cartCount, fetchCartData } = useCart();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check if user is authenticated (using either context or token)
  const isUserAuthenticated = !!user || isAuthenticated();

  // Fetch cart data when authentication status changes
  useEffect(() => {
    if (isUserAuthenticated) {
      fetchCartData();
    }
  }, [isUserAuthenticated, fetchCartData]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Filter only notifications and sort by date in descending order
      const smsNotifications = response.data
        .filter((n) => n.type === "sms")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(smsNotifications);
      setUnreadCount(smsNotifications.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark single notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Update local state with the updated notification from the backend
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === notificationId
              ? response.data.notification
              : notification
          )
        );

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Close dropdown after marking as read
        setShowNotifications(false);
      } else {
        throw new Error(
          response.data.message || "Failed to mark notification as read"
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to mark notification as read",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleNotificationClick = (e, notificationId) => {
    e.preventDefault();
    e.stopPropagation();
    markNotificationAsRead(notificationId);
  };

  useEffect(() => {
    if (isUserAuthenticated) {
      fetchNotifications();
      // Poll for new notifications every second
      const interval = setInterval(fetchNotifications, 1000);
      return () => clearInterval(interval);
    }
  }, [isUserAuthenticated]);

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Update local state with the updated notifications from the backend
        const smsNotifications = response.data.notifications
          .filter((n) => n.type === "sms")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setNotifications(smsNotifications);
        setUnreadCount(0);
        setShowNotifications(false);

        Swal.fire({
          title: "Success!",
          text: "All notifications marked as read",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to mark all notifications as read",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const darkClass = "dark";
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add(darkClass);
    } else {
      root.classList.remove(darkClass);
    }
  }, [isDarkMode]);

  useEffect(() => {
    setIsHome(location.pathname === "/");
    setIsLogin(location.pathname === "/login");
    setIsFixed(
      location.pathname === "/register" || location.pathname === "/login"
    );
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.pageYOffset;
      setScrollPosition(currentPosition);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  useEffect(() => {
    if (isHome) {
      if (scrollPosition > 100) {
        setNavBg(
          "bg-white backdrop-filter backdrop-blur-xl bg-opacity-0 text-black dark:text-white"
        );
      } else {
        setNavBg("bg-transparent text-white dark:text-white");
      }
    } else {
      setNavBg("bg-white dark:bg-gray-900 text-black dark:text-white");
    }
  }, [scrollPosition, isHome]);

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
        logout()
          .then(() => {
            Swal.fire({
              title: "Logged Out!",
              text: "You have been successfully logged out.",
              icon: "success",
            });
            navigate("/");
          })
          .catch((error) => console.log(error));
      }
    });
  };

  const handleNotificationClose = (e) => {
    if (
      !e.target.closest(".notification-dropdown") &&
      !e.target.closest(".notification-bell")
    ) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleNotificationClose);
    return () => {
      document.removeEventListener("click", handleNotificationClose);
    };
  }, []);

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`${
          isHome
            ? navBg
            : "bg-white dark:bg-gray-900 backdrop-blur-2xl text-black dark:text-white"
        } ${
          isFixed ? "static" : "fixed"
        } top-0 transition-colors duration-500 ease-in-out w-full z-10 hidden md:block`}
      >
        <div className="lg:w-[95%] mx-auto sm:px-6 lg:px-6">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex-shrink-0 cursor-pointer md:p-0 flex items-center">
              {/* mobile menu icons */}
              <div className="md:hidden flex items-center">
                <button
                  type="button"
                  onClick={toggleMobileMenu}
                  className="text-primary hover:text-white focus:outline-none"
                >
                  {isMobileMenuOpen ? (
                    <FaTimes className="h-6 w-6 hover:text-white" /> // Show close icon when menu is open
                  ) : (
                    <FaBars className="h-6 w-6 hover:text-white" /> // Show menu icon when menu is closed
                  )}
                </button>
              </div>
              <div onClick={() => navigate("/")} className="pl-5">
                <h1 className="text-2xl font-bold inline-flex gap-3 items-center">
                  EatEase <img src={logo} alt="" className="w-8 h-8" />
                </h1>
                <p className="font-bold text-[13px] tracking-[6px]">
                  Order Eat Relax
                </p>
              </div>
            </div>

            {isUserAuthenticated && (
              <div className="md:hidden">
                <Link to={`/dashboard/user-profile`}>
                  <img
                    src={currentUser?.photoUrl || userImg}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border-4 border-primary"
                  />
                </Link>
              </div>
            )}
            {/* Navigational links */}
            <div className="hidden md:block">
              <div className="flex">
                <ul className="ml-10 flex items-center space-x-5 pr-4">
                  {navLinks.map((link) => (
                    <li key={link.route}>
                      <NavLink
                        to={link.route}
                        style={{ whiteSpace: "nowrap" }}
                        className={({ isActive }) =>
                          `font-bold ${
                            isActive
                              ? "text-primary"
                              : navBg.includes("bg-transparent") && isHome
                              ? "text-white"
                              : "text-black dark:text-white"
                          } hover:text-primary duration-300`
                        }
                      >
                        {link.name}
                      </NavLink>
                    </li>
                  ))}

                  {currentUser?.role === "customer" && (
                    <li>
                      <NavLink
                        to="/cart"
                        className={({ isActive }) =>
                          `font-bold relative inline-flex items-center ${
                            isActive
                              ? "text-primary"
                              : navBg.includes("bg-transparent") && isHome
                              ? "text-white"
                              : "text-black dark:text-white"
                          } hover:text-primary duration-300`
                        }
                      >
                        <span className="relative">
                          Cart
                          {cartCount > 0 && (
                            <span className="absolute -top-3 -right-4 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {cartCount}
                            </span>
                          )}
                        </span>
                      </NavLink>
                    </li>
                  )}

                  {currentUser?.role === "admin" && (
                    <li>
                      <NavLink
                        to="/manage-locations"
                        className={({ isActive }) =>
                          `font-bold ${
                            isActive
                              ? "text-primary"
                              : navBg.includes("bg-transparent") && isHome
                              ? "text-white"
                              : "text-black dark:text-white"
                          } hover:text-primary duration-300`
                        }
                      >
                        Map
                      </NavLink>
                    </li>
                  )}

                  {/* based on users */}
                  {isUserAuthenticated ? null : isLogin ? (
                    <li>
                      <NavLink
                        to="/register"
                        className={({ isActive }) =>
                          `font-bold ${
                            isActive
                              ? "text-primary"
                              : `${
                                  navBg.includes("bg-transparent")
                                    ? "text-white"
                                    : "text-black dark:text-white"
                                }`
                          } hover:text-primary duration-300`
                        }
                      >
                        Register
                      </NavLink>
                    </li>
                  ) : (
                    <li>
                      <NavLink
                        to="/login"
                        className={({ isActive }) =>
                          `font-bold ${
                            isActive
                              ? "text-primary"
                              : `${
                                  navBg.includes("bg-transparent")
                                    ? "text-white"
                                    : "text-black dark:text-white"
                                }`
                          } hover:text-primary duration-300`
                        }
                      >
                        Login
                      </NavLink>
                    </li>
                  )}

                  {isUserAuthenticated && (
                    <li>
                      <NavLink
                        to={
                          currentUser?.role === "admin"
                            ? "/dashboard/admin-home"
                            : currentUser?.role === "restaurant_admin"
                            ? "/dashboard/restaurant-admin-home"
                            : currentUser?.role === "delivery_personnel"
                            ? "/dashboard/delivery-home"
                            : "/dashboard/user-home"
                        }
                        className={({ isActive }) =>
                          `font-bold ${
                            isActive
                              ? "text-primary"
                              : `${
                                  navBg.includes("bg-transparent")
                                    ? "text-white"
                                    : "text-black dark:text-white"
                                }`
                          } hover:text-primary duration-300`
                        }
                      >
                        Dashboard
                      </NavLink>
                    </li>
                  )}

                  {isUserAuthenticated && (
                    <li>
                      <Link to={`/dashboard/user-profile`}>
                        <img
                          src={currentUser?.photoUrl || userImg}
                          alt="User Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </Link>
                    </li>
                  )}

                  {isUserAuthenticated && (
                    <li>
                      <NavLink
                        onClick={handleLogout}
                        className={
                          "font-bold px-3 py-2 bg-primary text-white rounded-xl"
                        }
                      >
                        Logout
                      </NavLink>
                    </li>
                  )}

                  {isUserAuthenticated && (
                    <li className="relative">
                      <button
                        onClick={() => {
                          setShowNotifications(!showNotifications);
                          if (!showNotifications) {
                            fetchNotifications();
                          }
                        }}
                        className="notification-bell relative p-2 text-gray-600 hover:text-primary transition-colors bg-primary-light rounded-full shadow-sm"
                      >
                        <FaBell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>

                      {showNotifications && (
                        <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                          <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-black">
                              Notifications
                            </h3>
                            <div className="flex items-center gap-2">
                              {unreadCount > 0 && (
                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                  {unreadCount} unread
                                </span>
                              )}
                              {unreadCount > 0 && (
                                <button
                                  onClick={markAllNotificationsAsRead}
                                  className="p-1.5 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
                                  title="Mark all as read"
                                >
                                  <MdDoneAll className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">
                                No notifications
                              </div>
                            ) : (
                              notifications.map((notification) => (
                                <div
                                  key={notification._id}
                                  onClick={(e) =>
                                    !notification.isRead &&
                                    handleNotificationClick(e, notification._id)
                                  }
                                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                                    !notification.isRead ? "bg-blue-50" : ""
                                  }`}
                                >
                                  <div className="flex items-start">
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-800">
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(
                                          notification.createdAt
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                    {!notification.isRead && (
                                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        New
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="p-4 border-t">
                            <Link
                              to="/notifications"
                              className="text-primary hover:text-primary-dark text-sm font-medium"
                              onClick={() => setShowNotifications(false)}
                            >
                              View All Notifications
                            </Link>
                          </div>
                        </div>
                      )}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <div onClick={() => navigate("/")} className="flex items-center">
            <h1 className="text-xl font-bold inline-flex gap-2 items-center">
              EatEase <img src={logo} alt="" className="w-6 h-6" />
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isUserAuthenticated && (
              <>
                <Link to={`/dashboard/user-profile`}>
                  <img
                    src={currentUser?.photoUrl || userImg}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary"
                  />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) {
                        fetchNotifications();
                      }
                    }}
                    className="notification-bell relative p-2 text-gray-600 hover:text-primary transition-colors bg-primary-light rounded-full shadow-sm"
                  >
                    <FaBell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                      <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Notifications</h3>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              {unreadCount} unread
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllNotificationsAsRead}
                              className="p-1.5 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
                              title="Mark all as read"
                            >
                              <MdDoneAll className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              onClick={(e) =>
                                !notification.isRead &&
                                handleNotificationClick(e, notification._id)
                              }
                              className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                                !notification.isRead ? "bg-blue-50" : ""
                              }`}
                            >
                              <div className="flex items-start">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(
                                      notification.createdAt
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-4 border-t">
                        <Link
                          to="/notifications"
                          className="text-primary hover:text-primary-dark text-sm font-medium"
                          onClick={() => setShowNotifications(false)}
                        >
                          View All Notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex justify-around items-center h-14">
          {isUserAuthenticated ? (
            <>
              {currentUser?.role === "customer" &&
                customerMobileNav.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.route}
                      to={link.route}
                      className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full relative ${
                          isActive
                            ? "text-primary"
                            : "text-gray-600 dark:text-gray-400"
                        }`
                      }
                    >
                      <div className="relative">
                        <Icon className="w-5 h-5" />
                        {link.route === "/cart" && cartCount > 0 && (
                          <span className="absolute -top-2.5 -right-3 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}
                      </div>
                      <span className="text-xs mt-0.5">{link.name}</span>
                    </NavLink>
                  );
                })}

              {currentUser?.role === "delivery_personnel" &&
                deliveryMobileNav.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.route}
                      to={link.route}
                      className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full ${
                          isActive
                            ? "text-primary"
                            : "text-gray-600 dark:text-gray-400"
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs mt-0.5">{link.name}</span>
                    </NavLink>
                  );
                })}

              {currentUser?.role === "restaurant_admin" &&
                restaurantAdminMobileNav.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.route}
                      to={link.route}
                      className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full ${
                          isActive
                            ? "text-primary"
                            : "text-gray-600 dark:text-gray-400"
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs mt-0.5">{link.name}</span>
                    </NavLink>
                  );
                })}

              {currentUser?.role === "admin" &&
                adminMobileNav.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.route}
                      to={link.route}
                      className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full ${
                          isActive
                            ? "text-primary"
                            : "text-gray-600 dark:text-gray-400"
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs mt-0.5">{link.name}</span>
                    </NavLink>
                  );
                })}

              <NavLink
                to={
                  currentUser?.role === "admin"
                    ? "/dashboard/admin-home"
                    : currentUser?.role === "restaurant_admin"
                    ? "/dashboard/restaurant-admin-home"
                    : currentUser?.role === "delivery_personnel"
                    ? "/dashboard/delivery-home"
                    : "/dashboard/user-home"
                }
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full ${
                    isActive
                      ? "text-primary"
                      : "text-gray-600 dark:text-gray-400"
                  }`
                }
              >
                <MdDashboard className="w-5 h-5" />
                <span className="text-xs mt-0.5">Dashboard</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full ${
                    isActive
                      ? "text-primary"
                      : "text-gray-600 dark:text-gray-400"
                  }`
                }
              >
                <FaHome className="w-5 h-5" />
                <span className="text-xs mt-0.5">Home</span>
              </NavLink>
              <NavLink
                to={isLogin ? "/register" : "/login"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full ${
                    isActive
                      ? "text-primary"
                      : "text-gray-600 dark:text-gray-400"
                  }`
                }
              >
                <FaUser className="w-5 h-5" />
                <span className="text-xs mt-0.5">
                  {isLogin ? "Register" : "Login"}
                </span>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default NavBar;
