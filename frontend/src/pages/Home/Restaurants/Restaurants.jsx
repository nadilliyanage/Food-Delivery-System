import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="relative h-40">
          <img
            src={restaurant.imageUrl || "https://via.placeholder.com/400x300"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-full flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span className="text-sm font-semibold">{restaurant.rating || 'N/A'}</span>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>{restaurant.deliveryTime || '30-40 min'} • Min. ${restaurant.minOrder || '10'}</p>
            <p>Delivery Fee: ${restaurant.deliveryFee || '2.99'}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Restaurants = ({ searchQuery = { term: '', type: 'restaurant' } }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/restaurants/');
        setRestaurants(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch restaurants');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = searchQuery?.type === 'restaurant' && searchQuery?.term
    ? restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.term.toLowerCase())
      )
    : restaurants;

  if (loading) {
    return (
      <div className="py-6 px-4">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 px-4">
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      </div>
    );
  }
};

export default Restaurants; 