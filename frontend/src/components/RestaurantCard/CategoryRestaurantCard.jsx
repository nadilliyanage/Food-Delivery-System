import React from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaStarHalf } from "react-icons/fa";
import { MdAccessTime, MdDeliveryDining } from "react-icons/md";

const CategoryRestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalf key="half-star" className="text-yellow-400" />);
    }

    // Add empty stars to make total of 5
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaStar
          key={`empty-star-${i}`}
          className="text-gray-300 dark:text-gray-600"
        />
      );
    }

    return stars;
  };

  return (
    <div
      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
      className="flex-none w-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
    >
      <div className="relative">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {restaurant.isOpen ? (
          <span className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
            Open
          </span>
        ) : (
          <span className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
            Closed
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1">
            {renderRatingStars(restaurant.rating || 0)}
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              ({restaurant.rating})
            </span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {restaurant.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MdAccessTime className="text-primary" />
            <span>{restaurant.deliveryTime} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <MdDeliveryDining className="text-primary" />
            <span>${restaurant.deliveryFee}</span>
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {restaurant.address?.city || "Location not available"}
        </div>
      </div>
    </div>
  );
};

export default CategoryRestaurantCard;
