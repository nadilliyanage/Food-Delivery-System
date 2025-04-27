import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaClock,
  FaMotorcycle,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Scroll from "../hooks/useScroll";
import DeliveryMap from "../components/DeliveryMap";
import DeliverySimulation from "../components/DeliverySimulation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import OrderBillPDF from "./Bills/OrderBillPDF";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryPersonLocation, setDeliveryPersonLocation] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserRole(user.role);
    }

    fetchOrderDetails();
    if (order?.status === "On the Way") {
      // Poll more frequently for smoother animation
      const interval = setInterval(fetchDeliveryPersonLocation, 1000); // Update every 1 second
      return () => clearInterval(interval);
    }
  }, [orderId, order?.status]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to fetch order details. Please try again later.");
      setLoading(false);
    }
  };

  const fetchDeliveryPersonLocation = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/deliveries/order/${orderId}/location`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.location) {
        setDeliveryPersonLocation(response.data.location);
      }
    } catch (error) {
      console.error("Error fetching delivery person location:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="text-yellow-500" />;
      case "Preparing":
        return <FaClock className="text-orange-500" />;
      case "On the Way":
        return <FaMotorcycle className="text-blue-500" />;
      case "Delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "Cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Preparing":
        return "bg-orange-100 text-orange-800";
      case "On the Way":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || "Order not found"}</p>
        <button
          onClick={() => navigate("/my-orders")}
          className="mt-4 text-primary hover:underline"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14 lg:pt-20">
      <Scroll />
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/my-orders")}
            className="text-gray-600 hover:text-primary"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Order Status */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {order.restaurant?.name || "Restaurant"}
              </h2>
              <p className="text-gray-500 text-sm">
                Order #{order._id.slice(-6).toUpperCase()}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusIcon(order.status)}
              <span>{order.status}</span>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <PDFDownloadLink
                  document={<OrderBillPDF order={order} />}
                  fileName={`order_${order._id.slice(-6).toUpperCase()}.pdf`}
                >
                  {({ loading }) =>
                    loading ? (
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm">
                        Loading...
                      </button>
                    ) : (
                      <button className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition">
                        Download Bill
                      </button>
                    )
                  }
                </PDFDownloadLink>
              </div>
            </div>
          </div>

          {/* Map for On the Way status */}
          {order.status === "On the Way" && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Delivery Route</h3>
              <DeliveryMap
                deliveryPersonLocation={deliveryPersonLocation}
                restaurantLocation={
                  order.restaurant?.location?.coordinates || []
                }
                customerLocation={[
                  order.deliveryAddress?.longitude,
                  order.deliveryAddress?.latitude,
                ]}
              />
              {/* Add Delivery Simulation component */}
              {userRole === "delivery_personnel" && (
                <div className="mt-4">
                  <DeliverySimulation
                    orderId={orderId}
                    onSimulationComplete={() => {
                      // Refresh the delivery location after simulation
                      fetchDeliveryPersonLocation();
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Restaurant Details */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Restaurant Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <img
                  src={order.restaurant?.imageUrl || ""}
                  alt={order.restaurant?.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium">{order.restaurant?.name}</h4>
                  <p className="text-gray-600 text-sm">
                    {order.restaurant?.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <FaMapMarkerAlt />
                    <span>
                      {order.restaurant?.address?.street}
                      {order.restaurant?.address?.city &&
                        `, ${order.restaurant.address.city}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-medium mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <img
                    src={item.menuItem?.imageUrl || ""}
                    alt={item.menuItem?.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.menuItem?.name}</h4>
                      <span className="font-medium">
                        LKR {(item.menuItem?.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {item.menuItem?.description}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>LKR {order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>LKR 150.00</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>LKR {(order.totalPrice + 150).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mt-6">
            <h3 className="font-medium mb-2">Delivery Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">
                {order.deliveryAddress?.street}
                {order.deliveryAddress?.city &&
                  `, ${order.deliveryAddress.city}`}
              </p>
              {order.deliveryAddress?.instructions && (
                <p className="text-gray-600 mt-2">
                  <span className="font-medium">Instructions:</span>{" "}
                  {order.deliveryAddress.instructions}
                </p>
              )}
            </div>
          </div>

          {/* Order Date */}
          <div className="mt-6 text-gray-600">
            <p>
              Ordered on: {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
