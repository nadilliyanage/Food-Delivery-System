import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
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
import { getCurrentUser } from "../../../utils/auth";
import Swal from "sweetalert2";

const ManageOrders = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pinnedRestaurants, setPinnedRestaurants] = useState([]);
  const navigate = useNavigate();
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    // Load pinned restaurants from localStorage
    const loadPinnedRestaurants = () => {
      const saved = localStorage.getItem("pinnedRestaurants");
      if (saved) {
        setPinnedRestaurants(JSON.parse(saved));
      }
    };
    loadPinnedRestaurants();
    fetchRestaurants();

    // Add click outside listener for status dropdown
    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setStatusDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const togglePin = (restaurantId) => {
    setPinnedRestaurants((prev) => {
      const newPinned = prev.includes(restaurantId)
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId];

      // Save to localStorage
      localStorage.setItem("pinnedRestaurants", JSON.stringify(newPinned));
      return newPinned;
    });
  };

  // Sort restaurants with pinned ones first
  const getSortedRestaurants = () => {
    return [...restaurants].sort((a, b) => {
      const aIsPinned = pinnedRestaurants.includes(a._id);
      const bIsPinned = pinnedRestaurants.includes(b._id);
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return 0;
    });
  };

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

      // Fetch orders for each restaurant using the new endpoint
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
      toast.error("Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/dashboard/order-details/${orderId}`);
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
      // Show confirmation dialog
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

      // If user confirms, proceed with the update
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

        // Update the local state for orders list
        const updatedOrders = { ...orders };
        for (const restaurantId in updatedOrders) {
          updatedOrders[restaurantId] = updatedOrders[restaurantId].map(
            (order) =>
              order._id === orderId ? { ...order, status: newStatus } : order
          );
        }
        setOrders(updatedOrders);

        // Update the selected order state if it's the one being modified
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: newStatus,
          });
        }

        setStatusDropdown(null); // Close the dropdown

        // Show success message
        await Swal.fire({
          title: "Updated!",
          text: `Order status has been updated to ${newStatus}`,
          icon: "success",
          confirmButtonColor: "#000",
        });
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      // Show error message
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

  const getFilteredOrders = (restaurantId) => {
    if (!orders[restaurantId]) return [];
    return selectedStatus === "All"
      ? orders[restaurantId]
      : orders[restaurantId].filter((order) => order.status === selectedStatus);
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
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Your Orders
          </h1>
          <div className="relative">
            <div className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-white">
              <FaFilter className="text-gray-400 w-4 h-4" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-transparent pr-8 focus:outline-none text-gray-700"
              >
                <option value="All">All Orders</option>
                <option value="Pending">Pending Orders</option>
                <option value="Confirmed">Confirmed Orders</option>
                <option value="Preparing">Preparing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <FaChevronDown className="text-gray-400 w-4 h-4 absolute right-4" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {getSortedRestaurants().map((restaurant) => {
              const filteredOrders = getFilteredOrders(restaurant._id);
              const isPinned = pinnedRestaurants.includes(restaurant._id);

              return (
                <div key={restaurant._id} className="bg-white">
                  <div
                    className="px-6 py-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleRestaurant(restaurant._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={restaurant.imageUrl || getDefaultImage()}
                          alt={restaurant.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getDefaultImage();
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {restaurant.name}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePin(restaurant._id);
                              }}
                              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                                isPinned ? "text-primary" : "text-gray-400"
                              }`}
                              title={
                                isPinned ? "Unpin restaurant" : "Pin restaurant"
                              }
                            >
                              <FaThumbtack
                                className={`w-4 h-4 ${
                                  isPinned ? "rotate-45" : ""
                                }`}
                              />
                            </button>
                          </div>
                          <span className="text-green-600 text-sm">
                            {restaurant.registrationStatus
                              .charAt(0)
                              .toUpperCase() +
                              restaurant.registrationStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="font-medium text-primary">
                            {orders[restaurant._id]?.filter(
                              (order) => order.status === "Pending"
                            ).length || 0}
                          </span>
                          <span className="text-gray-500"> pending orders</span>
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
                          No {selectedStatus.toLowerCase()} orders found
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
                                            {getNextStatuses(order.status).map(
                                              (status) => (
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
                                              )
                                            )}
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
        )}
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
                        <div className="relative" ref={statusDropdownRef}>
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

export default ManageOrders;
