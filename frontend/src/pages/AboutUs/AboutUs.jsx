import React from "react";
import Scroll from "../../hooks/useScroll";

const AboutUs = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900 mt-10">
      <Scroll />
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          About Us
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover our journey, mission, and the passionate team behind delivering delicious meals to your doorstep, hassle-free.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Our Mission
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          At EatEase, we aim to connect people with their favorite meals through fast, reliable, and convenient food delivery. Our goal is to support local restaurants while offering customers a seamless dining experience at home.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Our Values
        </h2>
        <ul className="list-disc list-inside space-y-4 text-gray-700 dark:text-gray-300">
          <li><strong>Speed:</strong> We prioritize quick and efficient deliveries to ensure your food arrives fresh and hot.</li>
          <li><strong>Quality:</strong> We partner with the best restaurants to offer a diverse and delicious selection of meals.</li>
          <li><strong>Customer First:</strong> Your satisfaction is our top priority, and we strive to provide an excellent experience every time.</li>
          <li><strong>Community:</strong> We support local businesses and work to create a sustainable and thriving food ecosystem.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:scale-105 duration-300">
            <img src="./team-member-1.jpg" alt="Team Member" className="w-full h-40 object-cover rounded-lg mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Alex Johnson
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Founder & CEO
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:scale-105 duration-300">
            <img src="./team-member-2.jpg" alt="Team Member" className="w-full h-40 object-cover rounded-lg mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Emily Davis
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Head of Operations
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:scale-105 duration-300">
            <img src="./team-member-3.jpeg" alt="Team Member" className="w-full h-40 object-cover rounded-lg mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              David Lee
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Chief Technology Officer
            </p>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Join Us in Revolutionizing Food Delivery
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Whether you're a restaurant owner, delivery partner, or a food lover, be part of our growing community. Let’s bring great food closer to home, one order at a time.
        </p>
        <a href="/contact">
          <button className="bg-primary text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-green-700 transition-all duration-300">
            Get in Touch
          </button>
        </a>
      </section>
    </div>
  );
};

export default AboutUs;