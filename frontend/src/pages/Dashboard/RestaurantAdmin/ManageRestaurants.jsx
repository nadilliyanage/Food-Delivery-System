import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../../utils/auth";
import axios from "axios";
import Swal from "sweetalert2";
import Scroll from "../../../hooks/useScroll";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaSearch,
} from "react-icons/fa";

const ManageRestaurants = () => {
  const navigate = useNavigate();
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
    const filtered = restaurants.filter((restaurant) =>
      (restaurant.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  }, [searchQuery, restaurants]);

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

  const getDefaultImage = () => {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/restaurants/${restaurantId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          Swal.fire({
            title: "Deleted!",
            text: "Restaurant has been deleted.",
            icon: "success",
          });
          // Remove the deleted restaurant from the state
          setRestaurants(
            restaurants.filter((restaurant) => restaurant._id !== restaurantId)
          );
        }
      }
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete restaurant. Please try again.",
        icon: "error",
      });
    }
  };

  const handleToggleStatus = async (restaurantId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/restaurants/${restaurantId}`,
        { isActive: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Update the restaurants list with the updated status
        setRestaurants(
          restaurants.map((restaurant) =>
            restaurant._id === restaurantId
              ? { ...restaurant, isActive: !currentStatus }
              : restaurant
          )
        );

        Swal.fire({
          title: "Success!",
          text: `Restaurant ${
            !currentStatus ? "enabled" : "disabled"
          } successfully`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error updating restaurant status:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update restaurant status. Please try again.",
        icon: "error",
      });
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Restaurants</h2>
        <button
          onClick={() => navigate("/restaurant-registration")}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          Register New Restaurant
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
          placeholder="Search restaurants by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredRestaurants.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? "No restaurants found matching your search."
              : "You haven't registered any restaurants yet."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate("/restaurant-registration")}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
            >
              Register Your First Restaurant
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer"
              onClick={() =>
                navigate(`/dashboard/restaurant/${restaurant._id}`)
              }
            >
              <div className="relative h-48 mb-4">
                <img
                  src={restaurant.imageUrl || getDefaultImage()}
                  alt={restaurant.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = getDefaultImage();
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/restaurant/${restaurant._id}/edit`);
                    }}
                    className="p-2 rounded-full bg-white/90 hover:bg-white text-primary hover:text-primary-dark transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRestaurant(restaurant._id);
                    }}
                    className="p-2 rounded-full bg-white/90 hover:bg-white text-red-500 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
              <p className="text-gray-600 mb-2">{restaurant.cuisine}</p>
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
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <label
                    className="relative inline-flex items-center cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={restaurant.isActive}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(restaurant._id, restaurant.isActive);
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {restaurant.isActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageRestaurants;
