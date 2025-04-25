import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../../../utils/auth";
import axios from "axios";

const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/restaurants/user/restaurants`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setRestaurants(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching restaurants");
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="restaurant-management-container p-4">
      <h2 className="text-2xl font-bold mb-4">My Restaurants</h2>
      {restaurants.length === 0 ? (
        <p className="text-gray-600">
          You haven't registered any restaurants yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
              <div className="flex items-center justify-between">
                <span
                  className={`font-medium ${getStatusColor(
                    restaurant.registrationStatus
                  )}`}
                >
                  {restaurant.registrationStatus.charAt(0).toUpperCase() +
                    restaurant.registrationStatus.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Registered:{" "}
                  {new Date(restaurant.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;
