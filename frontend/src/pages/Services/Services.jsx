import React from "react";
import {
  FaMotorcycle,
  FaUtensils,
  FaClock,
  FaConciergeBell,
  FaBox,
  FaStar,
} from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import { NavLink } from "react-router-dom";
import Scroll from "../../hooks/useScroll";

const services = [
  {
    title: "Fast & Reliable Delivery",
    description: "Get your favorite meals delivered hot and fresh in no time!",
    icon: <FaMotorcycle />, 
    details: `We offer lightning-fast food delivery, ensuring that your meals arrive fresh and hot. Our real-time tracking system lets you know exactly when your order will reach your doorstep.`,
  },
  {
    title: "Wide Variety of Cuisines",
    description: "Choose from hundreds of restaurants and diverse cuisines.",
    icon: <FaUtensils />, 
    details: `From local favorites to international delicacies, our platform offers an extensive selection of cuisines to satisfy every craving.`,
  },
  {
    title: "24/7 Availability",
    description: "Cravings don't follow a schedule! Order anytime, anywhere.",
    icon: <FaClock />, 
    details: `Late-night hunger? No problem! We operate 24/7, making sure you get delicious meals delivered to your doorstep whenever you need them.`,
  },
  {
    title: "Personalized Meal Plans",
    description: "Subscribe to meal plans tailored to your dietary needs.",
    icon: <FaConciergeBell />, 
    details: `Enjoy personalized meal plans for a healthier lifestyle. Whether you need keto, vegan, or high-protein meals, we've got you covered.`,
  },
  {
    title: "Contactless Delivery",
    description: "Safe and hygienic deliveries with minimal contact.",
    icon: <FaBox />, 
    details: `For your safety and convenience, we provide contactless deliveries. Your food is delivered with utmost hygiene and care.`,
  },
  {
    title: "Customer Rewards & Discounts",
    description: "Earn rewards, enjoy discounts, and save on every order!",
    icon: <FaStar />, 
    details: `Our loyalty program lets you earn points on every order, which you can redeem for discounts, cashback, and exclusive deals!`,
  },
];

const Services = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900 mt-10">
      <Scroll />
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          Our Services
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Experience fast and reliable food delivery with a variety of choices,
          24/7 availability, and amazing rewards. Enjoy delicious meals with
          convenience like never before!
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <span className="text-3xl text-yellow-600">{service.icon}</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {service.title}
            </h2>
            <p className="text-gray-700 mb-4">{service.description}</p>
            <details className="text-gray-700 cursor-pointer group overflow-hidden">
              <summary className="flex items-center">
                <span className="text-yellow-600 hover:text-yellow-800 transition-all duration-300">
                  Read more
                </span>
                <IoMdArrowDropright className="ml-1 text-yellow-600 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 transition-all duration-300 ease-in-out max-h-0 group-open:max-h-[200px] overflow-auto">
                {service.details}
              </p>
            </details>
          </div>
        ))}
      </div>

      <section className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-white">
          What Our Customers Say
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <p className="text-gray-700 italic">
              "Super fast delivery! My food was hot and fresh. Love their service!"
            </p>
            <p className="text-right mt-4 text-gray-900 font-semibold">- Emily R.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <p className="text-gray-700 italic">
              "Great variety of restaurants to choose from. Highly recommend!"
            </p>
            <p className="text-right mt-4 text-gray-900 font-semibold">- Daniel M.</p>
          </div>
        </div>
      </section>

      <section className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-white">
          Ready to Order?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto dark:text-gray-300">
          Get your favorite meals delivered to your doorstep with ease. Join us
          now and enjoy the best food delivery experience!
        </p>
        <NavLink to={'/order'}>
          <button className="inline-block bg-primary text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-yellow-700 transition-all duration-300">
            Order Now
          </button>
        </NavLink>
      </section>
    </div>
  );
};

export default Services;