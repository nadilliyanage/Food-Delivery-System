import React from "react";
import bgImg from "../../../assets/food-banner-2.jpg"; // Replace with the sample image below
import { Link } from "react-router-dom";

const Promotion2 = () => {
  return (
    <div
      className="bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="h-[80vh] flex justify-start pl-11 items-center text-white bg-black bg-opacity-50">
        <div>
          <div className="space-y-4">
            <p className="md:text-4xl text-2xl">Delicious Meals, Delivered Fast!</p>
            <h1 className="md:text-7xl text-4xl font-bold">
              Your Favorite Restaurants, <br /> Just a Tap Away
            </h1>

            <div className="md:w-1/2">
              <p>
                Craving something tasty? Get mouthwatering dishes from top restaurants delivered straight to your doorstep. 
                Easy ordering, fast delivery, and amazing deals—just for you!
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <Link to={"/order"}>
                <button className="px-7 py-3 rounded-lg bg-secondary font-bold uppercase hover:scale-105 duration-300">
                  Order Now
                </button>
              </Link>
              <button className="px-7 py-3 rounded-lg border hover:bg-secondary font-bold uppercase">
                Explore Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotion2;
