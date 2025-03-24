import React from "react";
import {
  FaRecycle,
  FaTrashAlt,
  FaHandsHelping,
  FaLeaf,
  FaTruck,
  FaLightbulb,
} from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import { NavLink } from "react-router-dom";
import Scroll from "../../hooks/useScroll";

const services = [
  {
    title: "Waste Collection and Disposal",
    description:
      "Efficient and timely waste collection services tailored to your community's needs.",
    icon: <FaTrashAlt />,
    details: `Our waste collection service ensures the timely removal of household and commercial waste. We work with local authorities and communities to develop customized waste collection schedules and routes, minimizing disruption and ensuring effective waste management. Our team uses advanced tracking and monitoring systems to optimize efficiency and reduce carbon footprints.`,
  },
  {
    title: "Recycling Solutions",
    description:
      "Comprehensive recycling programs that promote sustainability and reduce landfill waste.",
    icon: <FaRecycle />,
    details: `We offer an array of recycling services to help divert waste from landfills. Our solutions include the collection and sorting of recyclable materials like paper, plastic, metal, and glass. We also provide educational programs to encourage community participation in recycling efforts and to promote environmental responsibility.`,
  },
  {
    title: "Composting and Organic Waste Management",
    description:
      "Turn organic waste into valuable compost for a greener, healthier environment.",
    icon: <FaLeaf />,
    details: `Our composting services allow households and businesses to convert organic waste into nutrient-rich compost. This not only reduces the volume of waste sent to landfills but also contributes to soil health and environmental sustainability. We provide compost bins, collection services, and guidance on composting best practices.`,
  },
  {
    title: "Hazardous Waste Management",
    description:
      "Safe handling and disposal of hazardous waste to protect people and the environment.",
    icon: <FaHandsHelping />,
    details: `We specialize in the safe handling and disposal of hazardous waste, including chemicals, batteries, and electronic waste (e-waste). Our team adheres to strict safety regulations to ensure the protection of the environment and public health. We also offer pick-up services and proper disposal methods for a wide range of hazardous materials.`,
  },
  {
    title: "Fleet and Logistics Management",
    description:
      "Optimized waste collection routes and fleet management for efficient operations.",
    icon: <FaTruck />,
    details: `Efficient logistics are key to our waste management services. We use state-of-the-art fleet management technologies to design optimal waste collection routes, minimizing fuel consumption and reducing our carbon footprint. Our goal is to improve collection efficiency while maintaining the highest standards of service quality.`,
  },
  {
    title: "Sustainability and Educational Programs",
    description:
      "Empowering communities with the knowledge and tools for sustainable waste management.",
    icon: <FaLightbulb />,
    details: `EcoTech provides educational programs designed to raise awareness about sustainable waste management practices. These programs include workshops, seminars, and digital resources that teach individuals and businesses how to reduce waste, recycle more effectively, and make eco-friendly choices.`,
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
          EcoTech offers a wide range of waste management services designed to
          reduce environmental impact, promote recycling, and ensure safe waste
          disposal. Discover how we can help your community achieve a cleaner
          future.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <span className="text-3xl text-green-600">{service.icon}</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {service.title}
            </h2>
            <p className="text-gray-700 mb-4">{service.description}</p>
            <details
              className="text-gray-700 cursor-pointer group overflow-hidden"
              open={false} // Initially closed
            >
              <summary className="flex items-center">
                <span className="text-green-600 hover:text-green-800 transition-all duration-300">
                  Read more
                </span>
                <IoMdArrowDropright className="ml-1 text-green-600 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 transition-all duration-300 ease-in-out max-h-0 group-open:max-h-[200px] overflow-auto">
                {service.details}
              </p>
            </details>
          </div>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8 dark:text-white">
          What Our Clients Say
        </h2>
        <div className="flex justify-center">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <p className="text-gray-700 italic">
                "EcoTech’s recycling program has greatly improved our community’s
                waste management. We’ve reduced landfill waste significantly."
              </p>
              <p className="text-right mt-4 text-gray-900 font-semibold">
                - Resident Sarah
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <p className="text-gray-700 italic">
                "Their hazardous waste disposal service helped us safely get rid
                of old batteries and chemicals. Very reliable!"
              </p>
              <p className="text-right mt-4 text-gray-900 font-semibold">
                - Business Owner Alex
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-white">
          Ready to Make a Difference?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto dark:text-gray-300">
          Contact us today to learn more about our waste management services and
          how we can help your community stay clean and green.
        </p>
        <NavLink to={'/contact'}>
          <button className="inline-block bg-secondary text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-green-700 transition-all duration-300">
            Contact Us
          </button>
        </NavLink>
      </section>
    </div>
  );
};

export default Services;
