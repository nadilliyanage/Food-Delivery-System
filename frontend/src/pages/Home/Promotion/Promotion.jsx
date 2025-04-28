import React from "react";
import bgImg from "../../../assets/food-banner.jpg";
import { Link } from "react-router-dom";

const Promotion = () => {
  return (
    <div className="relative overflow-hidden">
      <div
        className="h-[180px] md:h-[500px] lg:h-[600px] bg-cover bg-center w-full"
        style={{ backgroundImage: `url(${bgImg})` }}
      >
        <div className="h-full flex flex-col justify-center px-4 md:px-20 text-white bg-gradient-to-r from-black/70 to-black/40">
          <div className="md:max-w-xl">
            <h3 className="text-xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
              50% OFF Your First Order
            </h3>
            <p className="text-sm md:text-lg lg:text-xl mb-4 md:mb-6">
              Experience the best local restaurants with an exclusive welcome offer
            </p>
            <Link to="/order">
              <button className="px-4 md:px-8 py-2 md:py-3 bg-primary text-white text-sm md:text-base lg:text-lg font-semibold rounded-lg hover:scale-105 transition-transform">
                Order Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotion;
