import React, { useState, useEffect } from "react";
import { MdFoodBank, MdRestaurantMenu, MdNotifications } from "react-icons/md";
import {
  FaEye,
  FaCheck,
  FaTruck,
  FaChevronDown,
  FaChevronUp,
  FaFilter,
  FaEllipsisV,
  FaThumbtack,
  FaTimes,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getCurrentUser } from "../../utils/auth";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const RestaurantAdminHome = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredRestaurant, setHoveredRestaurant] = useState(null);
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurantsAndOrders();
  }, []);

  const fetchRestaurantsAndOrders = async () => {
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

      // Fetch orders for each restaurant
      const ordersData = {};
      for (const restaurant of response.data) {
        try {
          const ordersResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/orders/restaurant/${
              restaurant._id
            }`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          // Fetch customer details for each order
          const ordersWithCustomerDetails = await Promise.all(
            ordersResponse.data.map(async (order) => {
              try {
                const customerResponse = await axios.get(
                  `${import.meta.env.VITE_API_URL}/api/auth/users/${
                    order.customer
                  }`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                return {
                  ...order,
                  customerDetails: customerResponse.data,
                };
              } catch (error) {
                console.error(
                  `Error fetching customer details for order ${order._id}:`,
                  error
                );
                return order;
              }
            })
          );

          ordersData[restaurant._id] = ordersWithCustomerDetails;
        } catch (err) {
          console.error(
            `Error fetching orders for restaurant ${restaurant._id}:`,
            err
          );
          ordersData[restaurant._id] = [];
        }
      }

      setOrders(ordersData);
      setError(null);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError("Failed to fetch restaurants. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getOrderCounts = (restaurantId) => {
    const restaurantOrders = orders[restaurantId] || [];
    return {
      pending: restaurantOrders.filter((order) => order.status === "Pending")
        .length,
      confirmed: restaurantOrders.filter(
        (order) => order.status === "Confirmed"
      ).length,
      preparing: restaurantOrders.filter(
        (order) => order.status === "Preparing"
      ).length,
    };
  };

  const getNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "Pending":
        return ["Confirmed", "Cancelled"];
      case "Confirmed":
        return ["Preparing", "Cancelled"];
      case "Preparing":
        return ["Out for Delivery", "Cancelled"];
      case "Out for Delivery":
        return ["Delivered", "Cancelled"];
      default:
        return [];
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const result = await Swal.fire({
        title: "Confirm Status Update",
        text: `Are you sure you want to change the order status to ${newStatus}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#000",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        await axios.patch(
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
          updatedOrders[restaurantId] = updatedOrders[restaurantId].map(
            (order) =>
              order._id === orderId ? { ...order, status: newStatus } : order
          );
        }
        setOrders(updatedOrders);

        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: newStatus,
          });
        }

        setStatusDropdown(null);

        await Swal.fire({
          title: "Updated!",
          text: `Order status has been updated to ${newStatus}`,
          icon: "success",
          confirmButtonColor: "#000",
        });
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      await Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || "Failed to update order status",
        icon: "error",
        confirmButtonColor: "#000",
      });
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

  const getFilteredOrders = (restaurantId) => {
    if (!orders[restaurantId]) return [];
    return orders[restaurantId].filter(
      (order) =>
        order.status === "Pending" ||
        order.status === "Confirmed" ||
        order.status === "Preparing"
    );
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-6"
      >
        Restaurant Admin Dashboard
      </motion.h1>

      <div className="space-y-6">
        {/* Manage Restaurants Card */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Link to="/dashboard/manage-restaurants" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full transform transition-transform duration-300 hover:rotate-12">
                  <MdFoodBank className="text-3xl text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    Manage Restaurants & Menus
                  </h2>
                  <p className="text-gray-600">
                    View and manage your restaurants and menus
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Manage Orders Card */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary/10 p-3 rounded-full transform transition-transform duration-300 hover:rotate-12">
                <MdRestaurantMenu className="text-3xl text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">Manage Orders</h2>
                <p className="text-gray-600">
                  View and Manage restaurant orders
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {restaurants.map((restaurant) => {
                const filteredOrders = getFilteredOrders(restaurant._id);
                const counts = getOrderCounts(restaurant._id);

                return (
                  <div
                    key={restaurant._id}
                    className="bg-white border rounded-lg"
                  >
                    <div
                      className="px-6 py-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleRestaurant(restaurant._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={
                              restaurant.imageUrl ||
                              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                            }
                            alt={restaurant.name}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
                            }}
                          />
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {restaurant.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {counts.pending > 0 && (
                                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                                  {counts.pending} pending
                                </span>
                              )}
                              {counts.confirmed > 0 && (
                                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                                  {counts.confirmed} confirmed
                                </span>
                              )}
                              {counts.preparing > 0 && (
                                <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                                  {counts.preparing} preparing
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-medium text-primary">
                              {counts.pending +
                                counts.confirmed +
                                counts.preparing}
                            </span>
                            <span className="text-gray-500">
                              {" "}
                              active orders
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">
                              {filteredOrders.length} orders
                            </span>
                            {expandedRestaurant === restaurant._id ? (
                              <FaChevronUp className="text-gray-400 w-4 h-4" />
                            ) : (
                              <FaChevronDown className="text-gray-400 w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {expandedRestaurant === restaurant._id && (
                      <div className="border-t">
                        {filteredOrders.length === 0 ? (
                          <div className="p-6 text-center text-gray-500">
                            No active orders found
                          </div>
                        ) : (
                          <div className="divide-y">
                            {filteredOrders.map((order) => (
                              <div
                                key={order._id}
                                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleOrderClick(order)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {order._id.slice(-6).toUpperCase()}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {formatDate(order.createdAt)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-900">
                                      {order.customerDetails?.name || "Unknown"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      ${order.totalPrice.toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                                        order.status
                                      )}`}
                                    >
                                      {order.status}
                                    </span>
                                    {order.status !== "Delivered" &&
                                      order.status !== "Cancelled" && (
                                        <div className="relative">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setStatusDropdown(
                                                statusDropdown === order._id
                                                  ? null
                                                  : order._id
                                              );
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                          >
                                            <FaEllipsisV className="w-4 h-4" />
                                          </button>
                                          {statusDropdown === order._id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                                              {getNextStatuses(
                                                order.status
                                              ).map((status) => (
                                                <button
                                                  key={status}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateOrderStatus(
                                                      order._id,
                                                      status
                                                    );
                                                  }}
                                                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 
                                                  ${
                                                    status === "Cancelled"
                                                      ? "text-red-600"
                                                      : "text-gray-700"
                                                  }`}
                                                >
                                                  {status}
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <button
                onClick={closeOrderDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">{selectedOrder._id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </div>
                    {selectedOrder.status !== "Delivered" &&
                      selectedOrder.status !== "Cancelled" && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setStatusDropdown(
                                statusDropdown === selectedOrder._id
                                  ? null
                                  : selectedOrder._id
                              )
                            }
                            className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                          >
                            Change Status
                            <FaChevronDown
                              className={`w-3 h-3 transform transition-transform ${
                                statusDropdown === selectedOrder._id
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                          {statusDropdown === selectedOrder._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                              {getNextStatuses(selectedOrder.status).map(
                                (status) => (
                                  <button
                                    key={status}
                                    onClick={() => {
                                      updateOrderStatus(
                                        selectedOrder._id,
                                        status
                                      );
                                      setStatusDropdown(null);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 
                                  ${
                                    status === "Cancelled"
                                      ? "text-red-600"
                                      : "text-gray-700"
                                  }`}
                                  >
                                    {status}
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-3">Order Status Timeline</h3>
                  <div className="flex justify-between items-center">
                    {[
                      "Pending",
                      "Confirmed",
                      "Preparing",
                      "Out for Delivery",
                      "Delivered",
                    ].map((status, index) => (
                      <div
                        key={status}
                        className={`flex flex-col items-center relative ${
                          index <
                          [
                            "Pending",
                            "Confirmed",
                            "Preparing",
                            "Out for Delivery",
                            "Delivered",
                          ].indexOf(selectedOrder.status) +
                            1
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${
                            index <
                            [
                              "Pending",
                              "Confirmed",
                              "Preparing",
                              "Out for Delivery",
                              "Delivered",
                            ].indexOf(selectedOrder.status) +
                              1
                              ? "bg-primary"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <p className="text-xs mt-1">{status}</p>
                        {index < 4 && (
                          <div
                            className={`absolute top-2 left-4 w-[calc(100%-1rem)] h-0.5 -z-10 ${
                              index <
                              [
                                "Pending",
                                "Confirmed",
                                "Preparing",
                                "Out for Delivery",
                                "Delivered",
                              ].indexOf(selectedOrder.status)
                                ? "bg-primary"
                                : "bg-gray-300"
                            }`}
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">
                    {selectedOrder.customerDetails?.name || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>

                {selectedOrder.deliveryAddress && (
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium">
                      {selectedOrder.deliveryAddress.street},{" "}
                      {selectedOrder.deliveryAddress.city}
                    </p>
                    {selectedOrder.deliveryAddress.instructions && (
                      <p className="text-sm text-gray-500 mt-1">
                        Instructions:{" "}
                        {selectedOrder.deliveryAddress.instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">{item.menuItem?.name}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${(item.menuItem?.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total Amount</p>
                  <p className="text-xl font-bold">
                    ${selectedOrder.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">
                  {selectedOrder.paymentMethod}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantAdminHome;
