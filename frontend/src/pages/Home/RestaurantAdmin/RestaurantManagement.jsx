import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../../../utils/auth";
import axios from "axios";
import { FiClock, FiMapPin, FiPhone, FiSearch } from "react-icons/fi";

const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
        setFilteredRestaurants(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching restaurants");
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const filtered = restaurants.filter(
      (restaurant) =>
        (restaurant.name?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (restaurant.description?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (restaurant.address?.city?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        )
    );
    setFilteredRestaurants(filtered);
  }, [searchQuery, restaurants]);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatBusinessHours = (businessHours) => {
    if (!businessHours) return "Not set";
    const days = Object.keys(businessHours);
    if (days.length === 0) return "Not set";

    // Check if all days have the same hours
    const firstDay = days[0];
    const firstHours = businessHours[firstDay];
    const allSameHours = days.every(
      (day) =>
        businessHours[day].open === firstHours.open &&
        businessHours[day].close === firstHours.close
    );

    if (allSameHours) {
      return `All days: ${firstHours.open || "--:--"} - ${
        firstHours.close || "--:--"
      }`;
    }

    return "Custom hours";
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
      <h2 className="text-2xl font-bold mb-6">My Restaurants</h2>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
          placeholder="Search restaurants by name, description, or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredRestaurants.length === 0 ? (
        <p className="text-gray-600">
          {searchQuery
            ? "No restaurants found matching your search."
            : "You haven't registered any restaurants yet."}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Restaurant Image */}
              <div className="relative h-48 w-full">
                <img
                  src={
                    restaurant.imageUrl ||
                    "https://via.placeholder.com/400x200?text=No+Image"
                  }
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      restaurant.registrationStatus
                    )}`}
                  >
                    {restaurant.registrationStatus.charAt(0).toUpperCase() +
                      restaurant.registrationStatus.slice(1)}
                  </span>
                </div>
              </div>

              {/* Restaurant Details */}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">
                  {restaurant.name}
                </h3>

                <div className="space-y-2 text-gray-600">
                  <p className="text-sm line-clamp-2">
                    {restaurant.description}
                  </p>

                  <div className="flex items-center text-sm">
                    <FiMapPin className="mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {restaurant.address?.street}, {restaurant.address?.city}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <FiClock className="mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {formatBusinessHours(restaurant.businessHours)}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <FiPhone className="mr-2 flex-shrink-0" />
                    <span>{restaurant.phone}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Registered:{" "}
                    {new Date(restaurant.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;
