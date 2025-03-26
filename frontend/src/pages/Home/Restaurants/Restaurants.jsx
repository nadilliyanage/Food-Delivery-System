import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

// Temporary mock data - replace with actual API data later
const restaurants = [
  {
    id: 1,
    name: "Burger Palace",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    rating: 4.5,
    deliveryTime: "30-40 min",
    minOrder: "$10",
    deliveryFee: "$2.99"
  },
  {
    id: 2,
    name: "Pizza Express",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    rating: 4.8,
    deliveryTime: "25-35 min",
    minOrder: "$12",
    deliveryFee: "$1.99"
  },
  // Add more restaurants as needed
];

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="relative h-40">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-full flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span className="text-sm font-semibold">{restaurant.rating}</span>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>{restaurant.deliveryTime} • Min. ${restaurant.minOrder}</p>
            <p>Delivery Fee: ${restaurant.deliveryFee}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Restaurants = () => {
  return (
    <div className="py-6 px-4">
      <h2 className="text-2xl font-bold mb-4">Available Restaurants</h2>
      <div className="grid grid-cols-2 gap-4">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

export default Restaurants; 