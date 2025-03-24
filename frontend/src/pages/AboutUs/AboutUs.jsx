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
          Learn more about our mission, values, and the dedicated team behind
          our efforts to make waste management smarter, cleaner, and more
          sustainable for the future.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Our Mission
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          At EcoTech, our mission is to revolutionize waste management through
          innovative technology and sustainable practices. We aim to reduce
          environmental impact, improve recycling processes, and create
          cleaner, smarter cities by empowering communities to manage waste
          efficiently.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Our Values
        </h2>
        <ul className="list-disc list-inside space-y-4 text-gray-700 dark:text-gray-300">
          <li><strong>Innovation:</strong> We are committed to developing cutting-edge solutions that modernize waste management.</li>
          <li><strong>Sustainability:</strong> We promote practices that minimize waste and encourage recycling to protect our planet for future generations.</li>
          <li><strong>Integrity:</strong> We operate with transparency, ensuring trust in all aspects of our business.</li>
          <li><strong>Collaboration:</strong> We work closely with communities, governments, and businesses to create a cleaner environment together.</li>
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
              John Doe
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Founder & CEO
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:scale-105 duration-300">
            <img src="./team-member-2.jpg" alt="Team Member" className="w-full h-40 object-cover rounded-lg mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Jane Smith
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Head of Innovation
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:scale-105 duration-300">
            <img src="./team-member-3.jpg" alt="Team Member" className="w-full h-40 object-cover rounded-lg mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Michael Johnson
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Operations Manager
            </p>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Join Us in Making a Difference
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          We invite you to be part of our mission to create cleaner, greener communities.
          Whether you're a business, government, or an individual, there's a role for you in our effort
          to improve waste management and recycling. Together, we can shape a more sustainable future.
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
