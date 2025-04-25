import React from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant._id}`} className="block">
      <div className="flex-none w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer mb-2">
        <div className="relative">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-full flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span className="text-sm font-semibold">{restaurant.rating}</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">
            {restaurant.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-1 line-clamp-2">
            {restaurant.description}
          </p>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>{restaurant.address?.city || "Location not available"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
