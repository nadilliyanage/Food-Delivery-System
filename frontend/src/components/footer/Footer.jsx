import React from "react";
import logo from "/logo.png";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 mt-8 border-t border-gray-300 pt-8 dark:border-gray-500">
      <div className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-start lg:gap-8">
          <div className="">
            <img
              src={logo}
              alt="FoodDelivery Logo"
              className="w-screen px-20 h-auto md:hidden lg:hidden"
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8 lg:mt-0 lg:grid-cols-5 lg:gap-y-16">
            <div className="col-span-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Delicious Food Delivered!
                </h2>

                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Order your favorite meals from the best restaurants in town.
                  Fast delivery, great prices, and amazing food at your
                  doorstep.
                </p>
              </div>
            </div>

            <div className="col-span-2 lg:col-span-3 lg:flex lg:items-end">
              <form className="w-full">
                <label className="sr-only"> Email </label>

                <div className="border border-gray-100 p-2 focus-within:ring sm:flex sm:items-center sm:gap-4 dark:border-gray-800 rounded-lg">
                  <input
                    type="email"
                    id="UserEmail"
                    placeholder="Enter your email"
                    className="w-full border-none focus:ring-0 focus-within:outline-none sm:text-sm dark:bg-gray-900 dark:text-white"
                  />

                  <div>
                    <NavLink to={"/register"}>
                      <button className="mt-1 w-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white duration-300 hover:scale-105 hover:shadow-lg sm:mt-0 sm:w-auto sm:shrink-0 rounded-lg md:w-36">
                        Sign Up
                      </button>
                    </NavLink>
                  </div>
                </div>
              </form>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-900 dark:text-white">
                For Customers
              </p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <NavLink
                    to="/restaurants"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Browse Restaurants
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/promotions"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Special Offers
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/orders"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Track Order
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/favorites"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Favorite Restaurants
                  </NavLink>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-900 dark:text-white">
                For Restaurants
              </p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <NavLink
                    to="/restaurant/register"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Register Restaurant
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/restaurant/dashboard"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Restaurant Dashboard
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/restaurant/menu"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Menu Management
                  </NavLink>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-900 dark:text-white">
                For Delivery Partners
              </p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <NavLink
                    to="/delivery/register"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Become a Delivery Partner
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/delivery/dashboard"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Delivery Dashboard
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/delivery/earnings"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Earnings
                  </NavLink>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-900 dark:text-white">
                Support
              </p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <NavLink
                    to="/contact"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Contact Us
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/faq"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    FAQs
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/help"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Help Center
                  </NavLink>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-900 dark:text-white">
                About Us
              </p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <NavLink
                    to="/about"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Our Story
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/careers"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Careers
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/blog"
                    className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                  >
                    Blog
                  </NavLink>
                </li>
              </ul>
            </div>

            <ul className="col-span-2 flex justify-start gap-6 lg:col-span-5 lg:justify-end -mt-7">
              <li>
                <a
                  href="#"
                  rel="noreferrer"
                  target="_blank"
                  className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                >
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
              </li>

              <li>
                <a
                  href="#"
                  rel="noreferrer"
                  target="_blank"
                  className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                >
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>
              </li>

              <li>
                <a
                  href="#"
                  rel="noreferrer"
                  target="_blank"
                  className="text-gray-700 transition hover:opacity-75 dark:text-gray-200"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-300 pt-8 dark:border-gray-500">
          <div className="sm:flex sm:justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              &copy; 2025. FoodDelivery. All rights reserved.
            </p>

            <ul className="mt-8 flex flex-wrap justify-start gap-4 text-xs sm:mt-0 lg:justify-end">
              <li>
                <NavLink
                  to="/terms"
                  className="text-gray-500 transition hover:opacity-75 dark:text-gray-400"
                >
                  Terms & Conditions
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/privacy"
                  className="text-gray-500 transition hover:opacity-75 dark:text-gray-400"
                >
                  Privacy Policy
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/cookies"
                  className="text-gray-500 transition hover:opacity-75 dark:text-gray-400"
                >
                  Cookies Policy
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
