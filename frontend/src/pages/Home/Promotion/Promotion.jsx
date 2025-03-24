import React from "react";
import bgImg from "../../../assets/food-banner.jpg"; // Replace with a relevant food image
import { Link, NavLink } from "react-router-dom";

const Promotion = () => {
  return (
    <div
      className="bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="h-[80vh] flex justify-start pl-11 items-center text-white bg-black bg-opacity-50">
        <div>
          <div className="space-y-4">
            <p className="md:text-4xl text-2xl">Fast, Fresh, and Delivered to You</p>
            <h1 className="md:text-7xl text-4xl font-bold">
              Satisfy Your Cravings <br /> with Just a Tap!
            </h1>

            <div className="md:w-1/2">
              <p>
                Order from your favorite restaurants and enjoy hot, delicious meals at your doorstep. 
                Experience hassle-free delivery, amazing deals, and the best flavors in town!
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <Link to={"/order"}>
                <button className="px-7 py-3 rounded-lg bg-secondary font-bold uppercase hover:scale-105 duration-300">
                  Order Now
                </button>
              </Link>
              <NavLink to={"/restaurants"}>
                <button className="px-7 py-3 rounded-lg border hover:bg-secondary font-bold uppercase">
                  Browse Restaurants
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
