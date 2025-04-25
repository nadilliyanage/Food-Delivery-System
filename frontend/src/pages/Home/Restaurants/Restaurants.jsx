import React, { useState, useEffect } from "react";
import axios from "axios";
import RestaurantCard from "../../../components/RestaurantCard/RestaurantCard";

const Restaurants = ({ searchQuery = { term: "", type: "restaurant" } }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/restaurants/"
        );
        setRestaurants(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch restaurants");
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter((restaurant) => {
    if (!searchQuery.term) return true;
    return restaurant.name
      .toLowerCase()
      .includes(searchQuery.term.toLowerCase());
  });

  if (loading) {
    return (
      <div className="py-2 px-2">
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-2 px-2">
        <div className="text-center py-4 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="py-2 px-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant._id}
            restaurant={{
              _id: restaurant._id,
              name: restaurant.name,
              imageUrl: restaurant.imageUrl,
              rating: restaurant.rating,
              description: restaurant.description,
              address: restaurant.address,
              deliveryTime: restaurant.deliveryTime,
              minOrder: restaurant.minOrder,
              deliveryFee: restaurant.deliveryFee,
            }}
          />
        ))}
      </div>
      {filteredRestaurants.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No restaurants found
        </div>
      )}
    </div>
  );
};

export default Restaurants;
