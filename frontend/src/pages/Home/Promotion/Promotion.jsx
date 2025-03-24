import React from "react";

import bgImg from "../../../assets/banner-1.jpg";
import { Link, NavLink } from "react-router-dom";

const Promotion = () => {
  return (
    <div
      className="bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="h-1/2 flex justify-start pl-11 items-center text-white bg-black bg-opacity-50">
        <div>
          <div className="space-y-4">
            <p className="md:text-4xl text-2xl">Managing Waste for a</p>
            <h1 className="md:text-7xl text-4xl font-bold">
              Cleaner, Greener Tomorrow
            </h1>

            <div className="md:w-1/2">
              <p>
                Empowering communities with smart waste management solutions.
                From efficient collection to recycling, we provide innovative
                services to help reduce environmental impact and promote
                sustainability.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <Link to={"/login"}>
                <button className="px-7 py-3 rounded-lg bg-secondary font-bold uppercase hover:scale-105 duration-300">
                  Get Involved
                </button>
              </Link>
              <NavLink to={"/services"}>
                <button className="px-7 py-3 rounded-lg border hover:bg-secondary font-bold uppercase">
                  Explore Our Solutions
                </button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotion;
