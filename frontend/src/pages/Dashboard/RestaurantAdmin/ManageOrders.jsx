import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaEye,
  FaCheck,
  FaTruck,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { getCurrentUser } from "../../../utils/auth";

const ManageOrders = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
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

      // Fetch all orders for the restaurant admin
      try {
        const ordersResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/orders/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Group orders by restaurant ID
        const ordersData = {};
        for (const restaurant of response.data) {
          ordersData[restaurant._id] = ordersResponse.data.filter(
            (order) => order.restaurant === restaurant._id
          );
        }

        setOrders(ordersData);
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to fetch orders");

        // Initialize empty orders for each restaurant
        const emptyOrders = {};
        for (const restaurant of response.data) {
          emptyOrders[restaurant._id] = [];
        }
        setOrders(emptyOrders);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError("Failed to fetch restaurants. Please try again later.");
      toast.error("Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/dashboard/order-details/${orderId}`);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state
      const updatedOrders = { ...orders };
      for (const restaurantId in updatedOrders) {
        updatedOrders[restaurantId] = updatedOrders[restaurantId].map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        );
      }
      setOrders(updatedOrders);

      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Preparing":
        return "bg-purple-100 text-purple-800";
      case "Out for Delivery":
        return "bg-indigo-100 text-indigo-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  // Simple date formatting function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleRestaurant = (restaurantId) => {
    if (expandedRestaurant === restaurantId) {
      setExpandedRestaurant(null);
    } else {
      setExpandedRestaurant(restaurantId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Orders by Restaurant</h1>

      {restaurants.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-500 text-center">
            No restaurants found. Please register a restaurant first.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer flex justify-between items-center"
                onClick={() => toggleRestaurant(restaurant._id)}
              >
                <div className="flex items-center">
                  <div className="w-16 h-16 mr-4">
                    <img
                      src={restaurant.imageUrl || getDefaultImage()}
                      alt={restaurant.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getDefaultImage();
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                    <p className="text-gray-600">{restaurant.cuisine}</p>
                    <span
                      className={`font-medium ${getStatusColor(
                        restaurant.registrationStatus
                      )}`}
                    >
                      {restaurant.registrationStatus.charAt(0).toUpperCase() +
                        restaurant.registrationStatus.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-500">
                    {orders[restaurant._id]?.length || 0} orders
                  </span>
                  {expandedRestaurant === restaurant._id ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </div>
              </div>

              {expandedRestaurant === restaurant._id && (
                <div className="border-t">
                  {orders[restaurant._id]?.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No orders found for this restaurant.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders[restaurant._id]?.map((order) => (
                            <tr key={order._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order._id.substring(0, 8)}...
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(order.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.customer?.name || "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${order.totalPrice.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewOrder(order._id)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="View Details"
                                  >
                                    <FaEye />
                                  </button>

                                  {order.status === "Confirmed" && (
                                    <button
                                      onClick={() =>
                                        updateOrderStatus(
                                          order._id,
                                          "Preparing"
                                        )
                                      }
                                      className="text-purple-600 hover:text-purple-900"
                                      title="Mark as Preparing"
                                    >
                                      <FaCheck />
                                    </button>
                                  )}

                                  {order.status === "Preparing" && (
                                    <button
                                      onClick={() =>
                                        updateOrderStatus(
                                          order._id,
                                          "Out for Delivery"
                                        )
                                      }
                                      className="text-indigo-600 hover:text-indigo-900"
                                      title="Mark as Out for Delivery"
                                    >
                                      <FaTruck />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
