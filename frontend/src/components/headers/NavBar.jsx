import React, { useContext, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { FaBars, FaTimes, FaHome, FaCreditCard, FaInfoCircle, FaUtensils, FaEnvelope, FaUser, FaSignOutAlt, FaShoppingCart, FaListAlt, FaStore, FaMotorcycle, FaBox, FaChartBar } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
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
  { name: "Pick Orders", route: "/pick-orders", icon: FaBox },
  { name: "Deliveries", route: "/deliveries", icon: FaMotorcycle },
];

const restaurantAdminMobileNav = [
  { name: "Home", route: "/", icon: FaHome },
  { name: "Restaurant", route: "/manage-restaurant", icon: FaStore },
];

const adminMobileNav = [
  { name: "Home", route: "/", icon: FaHome },
];

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
  
  // Check if user is authenticated (using either context or token)
  const isUserAuthenticated = !!user || isAuthenticated();

  // Fetch cart data when authentication status changes
  useEffect(() => {
    if (isUserAuthenticated) {
      fetchCartData();
    }
  }, [isUserAuthenticated, fetchCartData]);

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
        logout().then(() => {
          Swal.fire({
            title: "Logged Out!",
            text: "You have been successfully logged out.",
            icon: "success",
          });
          navigate("/");
        }).catch((error) => console.log(error));
      }
    });
  };

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
                        to={currentUser?.role === 'admin' 
                          ? '/dashboard/admin-home' 
                          : currentUser?.role === 'restaurant_admin'
                          ? '/dashboard/restaurant-admin-home'
                          : currentUser?.role === 'delivery_personnel'
                          ? '/dashboard/delivery-home'
                          : '/dashboard/user-home'}
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
          {isUserAuthenticated && (
            <Link to={`/dashboard/user-profile`}>
              <img
                src={currentUser?.photoUrl || userImg}
                alt="User Avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-primary"
              />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex justify-around items-center h-14">
          {isUserAuthenticated ? (
            <>
              {currentUser?.role === 'customer' && customerMobileNav.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.route}
                    to={link.route}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center w-full h-full relative ${
                        isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"
                      }`
                    }
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {link.route === '/cart' && cartCount > 0 && (
                        <span className="absolute -top-2.5 -right-3 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs mt-0.5">{link.name}</span>
                  </NavLink>
                );
              })}
              
              {currentUser?.role === 'delivery_personnel' && deliveryMobileNav.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.route}
                    to={link.route}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center w-full h-full ${
                        isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs mt-0.5">{link.name}</span>
                  </NavLink>
                );
              })}
              
              {currentUser?.role === 'restaurant_admin' && restaurantAdminMobileNav.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.route}
                    to={link.route}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center w-full h-full ${
                        isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs mt-0.5">{link.name}</span>
                  </NavLink>
                );
              })}

              {currentUser?.role === 'admin' && adminMobileNav.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.route}
                    to={link.route}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center w-full h-full ${
                        isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs mt-0.5">{link.name}</span>
                  </NavLink>
                );
              })}
              
              <NavLink
                to={currentUser?.role === 'admin' 
                  ? '/dashboard/admin-home' 
                  : currentUser?.role === 'restaurant_admin'
                  ? '/dashboard/restaurant-admin-home'
                  : currentUser?.role === 'delivery_personnel'
                  ? '/dashboard/delivery-home'
                  : '/dashboard/user-home'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full ${
                    isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"
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
                    isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"
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
                    isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"
                  }`
                }
              >
                <FaUser className="w-5 h-5" />
                <span className="text-xs mt-0.5">{isLogin ? "Register" : "Login"}</span>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default NavBar;
