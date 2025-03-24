import React, { useContext } from "react";
import { FaFacebookF } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import Scroll from "../../hooks/useScroll";

const ContactUs = () => {

  return (
    <>
      <div className="flex justify-center items-center w-screen bg-white dark:bg-gray-900 mt-20 sm:mt-20">
        <Scroll/>
        <div className="container mx-auto my-4 px-4 lg:px-20">
          <div className="w-full p-8 my-4 md:px-12 lg:w-9/12 lg:pl-20 lg:pr-40 mr-auto rounded-2xl shadow-2xl dark:bg-gray-700">
            <div className="flex">
              <h1 className="font-bold uppercase text-5xl dark:text-white">
                Send us a <br /> message
              </h1>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
              <input
                className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="First Name*"
              />
              <input
                className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Last Name*"
              />
              <input
                className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                type="email"
                placeholder="Email*"
              />
              <input
                className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                type="number"
                placeholder="Phone*"
              />
            </div>
            <div className="my-4">
              <textarea
                placeholder="Message*"
                className="w-full h-32 bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
              ></textarea>
            </div>
            <div className="my-2 w-1/2 lg:w-1/4">
              <button
                className="uppercase text-sm font-bold tracking-wide bg-blue-900 text-gray-100 p-3 rounded-lg w-full 
                         focus:outline-none focus:shadow-outline"
              >
                Send Message
              </button>
            </div>
          </div>

          <div className="w-full lg:-mt-96 lg:w-2/6 px-8 py-12 ml-auto bg-blue-900 rounded-2xl">
  <div className="flex flex-col text-white">
    <h1 className="font-bold uppercase text-4xl my-4">
      Visit Our Office
    </h1>
    <p className="text-gray-400">
      Welcome to EcoTech! We are committed to sustainable waste management and creating cleaner, greener communities. Feel free to visit our office or contact us for any inquiries.
    </p>

    <div className="flex my-4 w-2/3 lg:w-1/2">
      <div className="flex flex-col">
        <i className="fas fa-map-marker-alt pt-2 pr-2" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-2xl">Main Office</h2>
        <p className="text-gray-400">
          45 Eco Lane, Green Town, Western
        </p>
      </div>
    </div>

    <div className="flex my-4 w-2/3 lg:w-1/2">
      <div className="flex flex-col">
        <i className="fas fa-phone-alt pt-2 pr-2" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-2xl">Contact Us</h2>
        <p className="text-gray-400">Tel: +94 117 888 999</p>
        <p className="text-gray-400">Fax: +94 11 555 2222</p>
      </div>
    </div>

    <div className="flex my-4 w-2/3 lg:w-1/2">
      <a
        href="#"
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-white h-8 w-8 inline-flex items-center justify-center mx-1"
      >
        <FaFacebookF className="text-blue-900" />
      </a>
      <a
        href="#"
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-white h-8 w-8 inline-flex items-center justify-center mx-1"
      >
        <FaLinkedinIn className="text-blue-900" />
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
