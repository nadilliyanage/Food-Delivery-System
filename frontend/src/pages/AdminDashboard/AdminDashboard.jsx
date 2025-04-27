import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../../utils/auth";
import axios from "axios";

const AdminDashboard = () => {
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingRestaurants();
  }, []);

  const fetchPendingRestaurants = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/restaurants/admin/pending-registrations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingRestaurants(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch pending restaurants");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (restaurantId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/restaurants/admin/registration-status/${restaurantId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh the list after update
      fetchPendingRestaurants();
    } catch (err) {
      setError("Failed to update restaurant status");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Restaurant Registration Requests
      </h1>

      {pendingRestaurants.length === 0 ? (
        <p className="text-gray-500 text-center">
          No pending registration requests
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingRestaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-medium">Cuisine:</span>{" "}
                  {restaurant.cuisine}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {restaurant.location}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {restaurant.phone}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {restaurant.email}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {restaurant.address.street}, {restaurant.address.city},{" "}
                  {restaurant.address.state} {restaurant.address.zipCode}
                </p>
                <p className="mt-4">
                  <span className="font-medium">Description:</span>{" "}
                  {restaurant.description}
                </p>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => handleStatusUpdate(restaurant._id, "approved")}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate(restaurant._id, "rejected")}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
