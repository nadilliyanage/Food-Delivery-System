import React from "react";
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaTwitter } from "react-icons/fa";
import Scroll from "../../hooks/useScroll";

const ContactUs = () => {
  return (
    <>
      <div className="flex justify-center items-center w-screen bg-white dark:bg-gray-900 mt-20 sm:mt-20">
        <Scroll />
        <div className="container mx-auto my-4 px-4 lg:px-20">
          <div className="w-full p-8 my-4 md:px-12 lg:w-9/12 lg:pl-20 lg:pr-40 mr-auto rounded-2xl shadow-2xl dark:bg-gray-700">
            <div className="flex">
              <h1 className="font-bold uppercase text-5xl dark:text-white">
                Get in Touch with Us!
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Have a question or need support? Fill out the form below and our team will get back to you as soon as possible.
            </p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
              <input
                className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Your Name*"
              />
              <input
                className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                type="email"
                placeholder="Your Email*"
              />
              <input
                className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Subject*"
              />
              <input
                className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                type="number"
                placeholder="Phone Number*"
              />
            </div>
            <div className="my-4">
              <textarea
                placeholder="Your Message*"
                className="w-full h-32 bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
              ></textarea>
            </div>
            <div className="my-2 w-1/2 lg:w-1/4">
              <button
                className="uppercase text-sm font-bold tracking-wide bg-primary text-white p-3 rounded-lg w-full hover:scale-105 duration-300"
              >
                Send Message
              </button>
            </div>
          </div>

          <div className="w-full lg:-mt-96 lg:w-2/6 px-8 py-12 ml-auto bg-primary rounded-2xl">
            <div className="flex flex-col text-white">
              <h1 className="font-bold uppercase text-4xl my-4">Contact Us</h1>
              <p className="text-gray-200">
                Need help with an order or have a business inquiry? Reach out to us!
              </p>

              <div className="flex my-4 w-2/3 lg:w-1/2">
                <div className="flex flex-col">
                  <h2 className="text-2xl">Our Address</h2>
                  <p className="text-gray-200">123, Temple Road, Malabe, Sri Lanka</p>
                </div>
              </div>

              <div className="flex my-4 w-2/3 lg:w-1/2">
                <div className="flex flex-col">
                  <h2 className="text-2xl">Support</h2>
                  <p className="text-gray-200">Phone: +94 11 218 8333</p>
                  <p className="text-gray-200">Email: support@eatease.com</p>
                </div>
              </div>

              <div className="flex my-4 w-2/3 lg:w-1/2 space-x-3">
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white h-10 w-10 inline-flex items-center justify-center"
                >
                  <FaFacebookF className="text-primary" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white h-10 w-10 inline-flex items-center justify-center"
                >
                  <FaInstagram className="text-primary" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white h-10 w-10 inline-flex items-center justify-center"
                >
                  <FaTwitter className="text-primary" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white h-10 w-10 inline-flex items-center justify-center"
                >
                  <FaLinkedinIn className="text-primary" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;