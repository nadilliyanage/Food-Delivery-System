import React from "react";

import bgImg from "../../../assets/banner-2.jpg";
import { Link } from "react-router-dom";

const Promotion2 = () => {
  return (
    <div
      className="bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="h-1/2 flex justify-start pl-11 items-center text-white bg-black bg-opacity-50">
        <div>
          <div className="space-y-4">
            <p className="md:text-4xl text-2xl">Pioneering the Future of</p>
            <h1 className="md:text-7xl text-4xl font-bold">
              Smart Waste Management
            </h1>

            <div className="md:w-1/2">
              <p>
                Committed to revolutionizing waste management through
                innovation. Our advanced solutions ensure efficient waste
                collection, recycling, and environmental protection for a
                cleaner and greener future.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <Link to={"/login"}>
                <button className="px-7 py-3 rounded-lg bg-secondary font-bold uppercase hover:scale-105 duration-300">
                  Get Started
                </button>
              </Link>
              <button className="px-7 py-3 rounded-lg border hover:bg-secondary font-bold uppercase">
                Discover Our Solutions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotion2;
